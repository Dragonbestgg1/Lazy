// app/upload/page.tsx
'use client';

import { useState, FormEvent } from 'react';

export default function UploadPage() {
  const [score, setScore] = useState<number | null>(null);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    // The taskId will be included automatically since its input has a name attribute
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setScore(data.score);
        setSimilarity(data.similarity);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to evaluate the submission.');
    }
  };

  return (
    <div>
      <h1>Upload Your DOCX File for Evaluation</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="docxFile">DOCX File:</label>
          <input type="file" id="docxFile" name="file" accept=".docx" required />
        </div>
        <button type="submit">Submit</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {score !== null && similarity !== null && (
        <div>
          <p>Score: {score}</p>
          <p>Similarity: {similarity.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
