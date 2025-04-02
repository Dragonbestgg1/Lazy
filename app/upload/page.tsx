'use client';

import React, { useState, FormEvent } from 'react';

interface UploadPageProps {
  taskId: string;
  requirements: string[] | string;
}

export default function UploadPage({ taskId, requirements }: UploadPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [similarity, setSimilarity] = useState<number | null>(null);

  // Generate a unique id for the file input by concatenating a prefix with the taskId.
  const fileInputId = `docFile-${taskId}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log("Selected file:", file.name);
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    if (selectedFile) {
      formData.append('file', selectedFile);
      formData.append('taskId', taskId);
      formData.append('requirements', JSON.stringify(requirements));
    }

    // try {
    //   const response = await fetch('/api/evaluate', {
    //     method: 'POST',
    //     body: formData,
    //   });

    //   const data = await response.json();

    //   if (response.ok) {
    //     setScore(data.score);
    //     setSimilarity(data.similarity);
    //   } else {
    //     setError(data.error || 'Something went wrong.');
    //   }
    // } catch (err) {
    //   setError('Failed to upload the file.');
    // }
  };

  return (
    <div className="w-full max-w-md bg-[rgba(0,0,0,0.5)] border-2 border-[#505178] border-opacity-60 p-6 rounded-2xl shadow-lg space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-100">Augšupielādē savu dokumentu</h1>
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor={fileInputId} className="text-sm font-medium text-gray-100">
            Izvēlies failu:
          </label>

          <label
            htmlFor={fileInputId}
            className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-[#5356c1]
            bg-[rgba(0,0,0,0.3)] rounded-lg cursor-pointer transition"
          >
            {selectedFile ? (
              <div className="flex flex-col items-center text-center">
                <svg
                  className="w-10 h-10 text-green-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-white font-medium break-all px-4">{selectedFile.name}</p>
                <p className="text-xs text-gray-300 mt-1">Fails pievienots</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg
                  className="w-10 h-10 text-blue-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V8m0 0L9.5 9.5M12 8l2.5 1.5M4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
                </svg>
                <span className="text-sm text-blue-100">Klikšķini vai ievelc dokumentu šeit</span>
                <span className="text-xs text-gray-300 mt-1">(.pdf, .docx, .txt)</span>
              </div>
            )}
          </label>
          <input
            type="file"
            id={fileInputId}
            name="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            required
            className="hidden"
          />
        </div>

        <button
          type="submit"
          disabled={!selectedFile}
          className={`w-full py-2 px-4 rounded-lg cursor-pointer font-semibold text-white transition ${
            !selectedFile ? 'bg-gray-400 cursor-pointer' : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          Iesniegt
        </button>
      </form>

      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      {score !== null && similarity !== null && (
        <div className="text-center mt-4 space-y-1">
          <p className="text-sm font-medium text-gray-200">Score: {score}</p>
          <p className="text-sm font-medium text-gray-200">
            Similarity: {typeof similarity === 'number' ? similarity.toFixed(2) : "N/A"}
          </p>
        </div>
      )}
    </div>
  );
}
