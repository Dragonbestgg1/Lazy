// File: /app/page.tsx
"use client";
import { useEffect, useState } from "react";
import UploadPage from "./upload/page";

type Task = {
  _id: string;
  title: string;
  requirements?: string[] | string;
  deadline: string;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched tasks:", data);
        if (Array.isArray(data)) {
          setTasks(data);
        } else if (data.tasks && Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        } else {
          setTasks([data]);
        }
      })
      .catch((err) => console.error("Error fetching tasks:", err));
  }, []);

  return (
    <div className="custom-bg min-h-screen py-3 px-3">
      <div className="flex justify-between items-center px-3 py-3">
        <h1 className="cursor-default font-bold text-left text-6xl bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 
        bg-clip-text text-transparent inline-block">
          Lazy
        </h1>
        <a href="http://localhost:3000/auth">
        <p className="cursor-pointer font-semibold text-md border-2 border-pink-800 rounded-lg px-3 py-1 bg-gradient-to-r 
        from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent text-center transition duration-300 ease-in-out 
        hover:border-purple-500 hover:shadow-md hover:scale-105">
          Admin
        </p>
      </a>
      </div>
      <div className="mt-">
        <h2 className="text-4xl flex justify-center font-bold mb-6">Visi uzdevumi</h2>

        {tasks.length > 0 ? (
          <div className="grid grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div key={task._id} className="p-4 rounded-lg shadow-md bg-[rgba(0, 0, 0, 0.3)]">
                <h3 className="font-bold text-xl mb-2 text-gray-100">{task.title}</h3>
                <p className="text-sm text-gray-200">
                  <strong></strong>{" "}
                  {Array.isArray(task.requirements)
                    ? task.requirements.join(", ")
                    : task.requirements || "N/A"}
                </p>
                <p className="text-sm text-gray-200 mt-1">
                  <strong>Termiņš līdz:</strong>{" "}
                  {new Date(task.deadline).toLocaleDateString()}
                </p>
                <div className="mt-3">
                  <UploadPage taskId={task._id} requirements={task.requirements || ""} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-200">No tasks found.</p>
        )}
      </div>
      </div>

  );
}
