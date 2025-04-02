"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import UploadPage from "./upload/page";

type Task = {
  _id: string;
  title: string;
  requirements?: string[] | string;
  deadline: string;
};

export default function Home() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTasks(data);
        } else if (data.tasks && Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        } else {
          setTasks([data]);
        }
        setLoading(false); 
      })
      .catch((err) => {
        console.error("Error fetching tasks:", err);
        setLoading(false); 
      });
  }, []);

  return (
    <div className="custom-bg min-h-screen py-3 px-3">
      <div className="flex justify-between items-center px-3 ">
        <h1 className="cursor-default font-bold text-left text-6xl bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 
          bg-clip-text text-transparent inline-block">
          Lazy
        </h1>
        {session ? (
          <div className="space-x-4 flex items-center">
            <Link
              href="/tasks"
              className="cursor-pointer font-semibold text-md border-2 border-pink-800 rounded-lg px-3 py-1 bg-gradient-to-r 
                from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent transition duration-300 ease-in-out 
                hover:border-purple-500 hover:shadow-md hover:scale-105"
            >
              Tasks
            </Link>
            <Link
              href="/dashboard"
              className="cursor-pointer font-semibold text-md border-2 border-pink-800 rounded-lg px-3 py-1 bg-gradient-to-r 
                from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent transition duration-300 ease-in-out 
                hover:border-purple-500 hover:shadow-md hover:scale-105"
            >
              Dashboard
            </Link>
            <button
              onClick={() => signOut()}
              className="cursor-pointer font-semibold text-md border-2 border-red-800 rounded-lg px-3 py-1 bg-gradient-to-r 
                from-red-600 via-red-500 to-red-400 text-white transition duration-300 ease-in-out 
                hover:border-red-500 hover:shadow-md hover:scale-105"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            className="cursor-pointer font-semibold text-md border-2 border-pink-800 rounded-lg px-3 py-1 bg-gradient-to-r 
              from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent transition duration-300 ease-in-out 
              hover:border-purple-500 hover:shadow-md hover:scale-105"
          >
            Admin
          </Link>
        )}
      </div>
      <div className="mt-4">
        <h2 className="text-4xl flex justify-center font-bold mb-6">Visi uzdevumi</h2>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 border-opacity-50"></div>
          </div>
        ) : tasks.length > 0 ? (
          <div className="grid grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div key={task._id} className="p-4 rounded-lg shadow-md bg-[rgba(0, 0, 0, 0.3)]">
                <h3 className="font-bold text-xl mb-2 text-gray-100">{task.title}</h3>
                <p className="text-sm text-gray-200">
                  {Array.isArray(task.requirements)
                    ? task.requirements.join(", ")
                    : task.requirements || "N/A"}
                </p>
                <p className="text-sm text-gray-200 mt-1">
                  <strong>Termiņš līdz:</strong>{" "}
                  {new Date(task.deadline).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                <div className="mt-3">
                  <UploadPage taskId={task._id} requirements={task.requirements || ""} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-200 text-center">No tasks found.</p>
        )}
      </div>
    </div>
  );
}
