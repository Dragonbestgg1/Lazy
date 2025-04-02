import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Converts total minutes since midnight to HH:MM (for display)
function minutesToHHMM(totalMins: number) {
  const hh = Math.floor(totalMins / 60);
  const mm = Math.floor(totalMins % 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    // --- 1. Navigation and Teacher Selection ---
    const { searchParams } = new URL(request.url);
    const teacherQueryRaw = searchParams.get('teacher') || 'Koordinators';
    const teacherQuery = decodeURIComponent(teacherQueryRaw);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://pteh.edupage.org/timetable/', { waitUntil: 'networkidle2' });
    
    // Click on the "Skolotāji" tab
    await page.waitForSelector('span[title="Skolotāji"]', { timeout: 10000 });
    await page.click('span[title="Skolotāji"]');
    await delay(2000);
    
    // Wait for dropdown items and select the teacher.
    await page.waitForSelector('.dropDownPanel.asc-context-menu li', { timeout: 15000 });
    const clickedTeacher = await page.evaluate((teacherName) => {
      const listItems = Array.from(document.querySelectorAll('.dropDownPanel.asc-context-menu li'));
      const target = listItems.find(li => li.textContent?.trim() === teacherName);
      if (target) {
        (target as HTMLElement).click();
        return true;
      }
      return false;
    }, teacherQuery);
    if (!clickedTeacher) {
      throw new Error(`No <li> found for teacher "${teacherQuery}"`);
    }
    await delay(6000);
    await page.waitForSelector('svg text', { timeout: 15000 });
    
    // --- 2. Read Scale Factor and Scrape Elements ---
    const scaleString = await page.evaluate(() => {
      const gEl = document.querySelector('g[transform^="scale("]');
      return gEl ? gEl.getAttribute('transform') : null;
    });
    let scaleFactor = 1.0;
    if (scaleString) {
      const match = scaleString.match(/scale\(([\d.]+)/);
      if (match) scaleFactor = parseFloat(match[1]);
    }
    
    // Scrape <rect> elements representing lesson blocks
    const rawRects = await page.evaluate(() => {
      const rectEls = Array.from(document.querySelectorAll('svg rect'));
      return rectEls.map(el => ({
        x: parseFloat(el.getAttribute('x') || '0'),
        y: parseFloat(el.getAttribute('y') || '0'),
        width: parseFloat(el.getAttribute('width') || '0'),
        height: parseFloat(el.getAttribute('height') || '0')
      }));
    });
    
    // Scrape all <text> elements (includes day headers and lesson labels)
    const rawTexts = await page.evaluate(() => {
      const textEls = Array.from(document.querySelectorAll('svg text'));
      return textEls.map(el => ({
        text: el.textContent?.trim() || '',
        x: parseFloat(el.getAttribute('x') || '0'),
        y: parseFloat(el.getAttribute('y') || '0')
      }));
    });
    await browser.close();
    
    // Apply scale factor to coordinates
    const rects = rawRects.map(item => ({
      x: item.x * scaleFactor,
      y: item.y * scaleFactor,
      width: item.width * scaleFactor,
      height: item.height * scaleFactor
    }));
    const texts = rawTexts.map(item => ({
      text: item.text,
      x: item.x * scaleFactor,
      y: item.y * scaleFactor
    }));
    
    // --- 3. Grouping by Day ---
    const dayLabels = ['Pi', 'Ot', 'Tr', 'Ce', 'Pi'];
    const dayHeaders = texts
      .filter(t => dayLabels.includes(t.text))
      .map(t => ({ ...t, yNum: t.y }))
      .sort((a, b) => a.yNum - b.yNum);
    
    const dayGroups: Array<{
      day: string;
      startY: number;
      endY: number;
      rects: typeof rects;
      texts: typeof texts;
    }> = [];
    for (let i = 0; i < dayHeaders.length; i++) {
      const current = dayHeaders[i];
      const next = dayHeaders[i + 1];
      const startY = current.yNum;
      const endY = next ? next.yNum : 999999;
      const groupRects = rects.filter(r => r.y >= startY && r.y < endY);
      const groupTexts = texts.filter(t => t.y >= startY && t.y < endY);
      dayGroups.push({ day: current.text, startY, endY, rects: groupRects, texts: groupTexts });
    }
    
    // --- 4. Compute Time Scale ---
    let globalWidth = 0;
    for (const dg of dayGroups) {
      for (const r of dg.rects) {
        const rightEdge = r.x + r.width;
        if (rightEdge > globalWidth) globalWidth = rightEdge;
      }
    }
    const totalMinutes = 500; // 8:30 to 16:50
    const minutesPerPx = totalMinutes / globalWidth;
    const baseTimeMins = 8 * 60 + 30;
    
    // --- 5. Group Lesson Blocks and Compute Times ---
    const verticalTolerance = 70; // Adjust as needed.
    interface Lesson {
      day: string;
      group: string;
      subject: string;
      startTime: string;
      endTime: string;
    }
    const lessons: Lesson[] = [];
    
    // For each day group, bucket rects by vertical position.
    for (const dg of dayGroups) {
      const buckets: Record<number, typeof dg.rects> = {};
      for (const r of dg.rects) {
        const bucket = Math.round(r.y / verticalTolerance) * verticalTolerance;
        if (!buckets[bucket]) buckets[bucket] = [];
        buckets[bucket].push(r);
      }
      
      // For each bucket, compute time range and merge text info.
      for (const [bucketStr, rectGroup] of Object.entries(buckets)) {
        const minX = Math.min(...rectGroup.map(r => r.x));
        const maxX = Math.max(...rectGroup.map(r => r.x + r.width));
        const startMins = baseTimeMins + (minX * minutesPerPx);
        const endMins = baseTimeMins + (maxX * minutesPerPx);
        const startTime = minutesToHHMM(startMins);
        const endTime = minutesToHHMM(endMins);
        
        // Use the center of the rect group to locate text.
        const bucketCenterX = (minX + maxX) / 2;
        const horizTolerance = 50;
        
        // For subject: look for texts containing keywords.
        const subjectCandidates = dg.texts.filter(t =>
          Math.abs(t.x - bucketCenterX) < horizTolerance &&
          /(prakse|izstrād|programmē)/i.test(t.text)
        );
        // For group: assume group labels start with "IP".
        const groupCandidates = dg.texts.filter(t =>
          Math.abs(t.x - bucketCenterX) < horizTolerance &&
          /^IP/i.test(t.text)
        );
        const subjectText = subjectCandidates.map(t => t.text).join(" / ");
        const groupText = groupCandidates.map(t => t.text).join(" / ");
        
        lessons.push({
          day: dg.day,
          group: groupText || "N/A",
          subject: subjectText || "N/A",
          startTime,
          endTime,
        });
      }
    }
    
    // --- 6. Sort Lessons by Day and Start Time ---
    const dayOrder: Record<string, number> = { Pi: 1, Ot: 2, Tr: 3, Ce: 4, Pi2: 5 };
    lessons.sort((a, b) => {
      if (a.day === b.day) {
        return a.startTime.localeCompare(b.startTime);
      }
      const orderA = dayOrder[a.day] || 99;
      const orderB = dayOrder[b.day] || 99;
      return orderA - orderB;
    });
    
    return NextResponse.json({ data: lessons });
  } catch (error) {
    console.error("Error scraping data:", error);
    return NextResponse.json({ error: "Failed to scrape data" }, { status: 500 });
  }
}