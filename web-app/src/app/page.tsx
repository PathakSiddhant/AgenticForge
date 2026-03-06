"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("AI is waiting for your command... 🤖");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!input) return; // Agar input khali hai toh kuch mat karo
    
    setLoading(true);
    setReply("AI Soch raha hai... 🤔");

    try {
      // Dhyan de: Ab hum POST request bhej rahe hain /chat wale endpoint par
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }), // User ka typed message JSON format mein
      });
      
      const data = await res.json();
      setReply(data.reply); // AI ka answer screen par set kar diya
    } catch (error) {
      setReply("Error: AI Engine se connect nahi ho paya ya API limit cross ho gayi bhai!");
    }
    
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-slate-950 text-white">
      <h1 className="text-5xl font-extrabold mb-8 text-blue-400">AgenticForge</h1>
      
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {/* Input Field */}
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Apna prompt yahan type kar bhai..." 
          className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:border-blue-500 text-lg text-white placeholder-slate-400"
        />
        
        {/* Submit Button */}
        <button
          onClick={askAI}
          disabled={loading}
          className="w-full py-4 bg-blue-600 rounded-xl font-bold text-lg hover:bg-blue-500 transition-all disabled:opacity-50"
        >
          {loading ? "Processing..." : "Ask AI Engine 🚀"}
        </button>

        {/* AI Output Box */}
        <div className="mt-8 p-6 border border-slate-700 rounded-xl bg-slate-900 shadow-lg min-h-[150px]">
          <p className="text-lg text-emerald-400 whitespace-pre-wrap">{reply}</p>
        </div>
      </div>
    </main>
  );
}