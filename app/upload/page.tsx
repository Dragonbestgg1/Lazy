'use client';

import React, { useState, FormEvent } from 'react';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [taskId, setTaskId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [similarity, setSimilarity] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
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
      setError('Failed to upload the file.');
    }
  };

  return (
    <div>
      <h1>Upload Your Documentation</h1>
      <p>Augšupielādē savu dokumentāciju (PDF, DOCX, TXT u.c.)</p>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label htmlFor="taskId">Task ID:</label>
          <input
            type="text"
            id="taskId"
            name="taskId"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            placeholder="Enter Task ID"
            required
          />
        </div>
        <div>
          <label htmlFor="docFile">Select File:</label>
          <input
            type="file"
            id="docFile"
            name="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            required
          />
        </div>
        <button type="submit" disabled={!selectedFile || !taskId}>
          Upload
        </button>
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
