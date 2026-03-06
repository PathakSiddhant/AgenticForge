"use client";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("AI Engine sleeping... 😴");

  // Ye function tere Python API ko call karega
  const wakeUpAI = async () => {
    try {
      const res = await fetch("http://localhost:8000/");
      const data = await res.json();
      setMessage(data.message); // Python se aane wala message state mein set kar diya
    } catch (error) {
      setMessage("Error: Backend on nahi hai ya CORS issue hai bhai!");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950 text-white">
      <h1 className="text-5xl font-extrabold mb-4 text-blue-400">AgenticForge</h1>
      <p className="mb-8 text-xl font-medium text-slate-300">Architecture Status:</p>
      
      {/* Ye box tera message dikhayega */}
      <div className="p-6 mb-8 border border-slate-700 rounded-xl bg-slate-900 shadow-lg">
        <p className="text-lg font-mono text-emerald-400">{message}</p>
      </div>

      <button
        onClick={wakeUpAI}
        className="px-8 py-4 bg-blue-600 rounded-full font-bold hover:bg-blue-500 hover:scale-105 transition-all shadow-blue-500/50 shadow-lg"
      >
        Wake Up AI Engine 🚀
      </button>
    </main>
  );
}