"use client";

import { useEffect, useState } from "react";

interface Lesson {
  day: string;
  group: string;
  subject: string;
  startTime: string;
  endTime: string;
}

export default function ScrapedDataPage() {
  const [data, setData] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/scrape?teacher=" + encodeURIComponent("Toms Ričards Krieviņš"))
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching scraped data:", err);
        setError("Error fetching scraped data");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading scraped data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (data.length === 0)
    return <p>No lessons found for teacher "Toms Ričards Krieviņš".</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Timetable for Toms Ričards Krieviņš</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Day</th>
            <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Start Time</th>
            <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>End Time</th>
            <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Group</th>
            <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Subject</th>
          </tr>
        </thead>
        <tbody>
          {data.map((lesson, idx) => (
            <tr key={idx}>
              <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{lesson.day}</td>
              <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{lesson.startTime}</td>
              <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{lesson.endTime}</td>
              <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{lesson.group}</td>
              <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{lesson.subject}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}