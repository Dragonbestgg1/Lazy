"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setMessage({ type: "error", text: "Ievadi derīgu e-pasta adresi" });
      return;
    }

    if (!validatePassword(password)) {
      setMessage({ type: "error", text: "Parolei jābūt vismaz 8 rakstzīmēm garai" });
      return;
    }

    // Use NextAuth signIn with the credentials provider
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.ok) {
      setMessage({ type: "success", text: "Login successful" });
      // Redirect to a protected route after successful login
      router.push("/");
    } else {
      setMessage({ type: "error", text: "Invalid admin credentials" });
    }
  };

  return (
    <div className="custom-bg min-h-screen py-3 px-3">
      <div className="px-3">
      <a href="http://localhost:3000/">
        <h1
          className="cursor-pointer font-bold text-left text-6xl bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 
          bg-clip-text text-transparent inline-block transition-all duration-300 ease-in-out hover:scale-103 hover:from-indigo-500 hover:via-fuchsia-500 hover:to-orange-400"
        >
          Lazy
        </h1>
      </a>
      </div>
      <div className="mt-10 flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white dark:bg-[rgba(0,0,0,0.5)] glow-purple border-2 border-[#505178] rounded-2xl shadow-xl space-y-6 transition-all duration-300">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Ienākt
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">E-pasts</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Parole</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-4 py-2 cursor-pointer rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 
              hover:to-pink-600 text-white font-semibold transition duration-300"
            >
              Ienākt
            </button>
          </form>

          {message && (
            <p
              className={`text-center text-sm ${
                message.type === "success" ? "text-green-500" : "text-red-500"
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
