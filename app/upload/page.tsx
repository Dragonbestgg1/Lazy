'use client';

import React, { useState, FormEvent } from 'react';

export default function UploadPage() {
  const [score, setScore] = useState<number | null>(null);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget); 
    // This automatically includes the file from the file input 
    // and the taskId if you gave it a `name="taskId"` attribute.

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setScore(data.score);
        setSimilarity(data.similarity);
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to upload and evaluate the file.');
    }
  };

  return (
    <div>
      <h1>Upload DOCX File</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="docxFile">Select DOCX File:</label>
          <input
            type="file"
            id="docxFile"
            name="file"
            accept=".docx"
            required
          />
        </div>

        <button type="submit">Upload & Evaluate</button>
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
