'use client';

import { useState } from 'react';

export default function CreateTaskPage() {
  const [title, setTitle] = useState('');
  const [requirements, setRequirements] = useState('');
  const [deadline, setDeadline] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Nosaukums ir obligāts' });
      return;
    }
    if (!requirements.trim()) {
      setMessage({ type: 'error', text: 'Prasības ir obligātas' });
      return;
    }
    if (!deadline) {
      setMessage({ type: 'error', text: 'Termiņš ir obligāts' });
      return;
    }

    const selectedDeadline = new Date(deadline);
    const currentDate = new Date();

    if (selectedDeadline < currentDate) {
      setMessage({ type: 'error', text: 'Termiņš nevar būt pagātnē' });
      return;
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, requirements, deadline }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Uzdevums veiksmīgi izveidots' });
        setTitle('');
        setRequirements('');
        setDeadline('');
      } else {
        setMessage({ type: 'error', text: `${data.error}` });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `${error.message}` });
    }
  }

  return (
    <div className="custom-bg min-h-screen py-3 px-3">
      <a href="http://localhost:3000/">
      <h1
        className="cursor-pointer font-bold text-left text-6xl bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 
          bg-clip-text text-transparent inline-block transition-all duration-300 ease-in-out hover:scale-103 hover:from-indigo-500 hover:via-fuchsia-500 hover:to-orange-400">
        Lazy
      </h1>
      </a>

      <div className="mt-12 flex justify-center items-center">
        <div className="w-full max-w-lg mx-auto bg-[rgba(0,0,0,0.5)] border border-[#505178] rounded-xl p-6 space-y-6 glow-box">
          <h1 className="text-3xl font-bold font-poppins text-center text-gray-800 dark:text-gray-100">
            Izveidot uzdevumu
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nosaukums:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Prasības:</label>
              <input
                type="text"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Termiņš:</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 cursor-pointer rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full cursor-pointer bg-purple-600 mt-4 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition duration-200"
            >
              Izveidot
            </button>
          </form>

          {message && (
            <p
              className={`text-center text-sm font-medium mt-4 ${
                message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}