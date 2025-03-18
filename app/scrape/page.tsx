"use client";

import { useEffect, useState } from "react";

interface Lesson {
  period: number;
  time: string;
  subject: string;
  teacher: string;
  location: string;
}

export default function ScrapedData() {
  const [data, setData] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const teacherName = "koordinators";

  useEffect(() => {
    fetch(`/api/scrape?teacher=${encodeURIComponent(teacherName)}`)
      .then((res) => res.json())
      .then((response) => {
        if (response.error) {
          setError(response.error);
        } else {
          setData(response.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching scraped data:", err);
        setError("Error fetching scraped data");
        setLoading(false);
      });
  }, [teacherName]);

  if (loading) return <p>Loading scraped data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (data.length === 0) return <p>No lessons found for teacher "{teacherName}".</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lessons for {teacherName}</h1>
      <ul>
        {data.map((lesson, idx) => (
          <li key={idx} className="mb-2 p-2 border rounded">
            <p><strong>Period:</strong> {lesson.period}</p>
            <p><strong>Time:</strong> {lesson.time}</p>
            <p><strong>Subject:</strong> {lesson.subject}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}