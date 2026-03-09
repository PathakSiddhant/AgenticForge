"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Message = { role: "user" | "model"; content: string };

export default function MemoryBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input } as Message];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          history: messages,
          message: input
        }),
      });
      
      const data = await res.json();
      
      if(data.reply) {
        setMessages((prev) => [...prev, { role: "model", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "model", content: "Error: " + data.error }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "model", content: "Connection Error! Is Python running?" }]);
    }
    
    setLoading(false);
  };

  return (
    // FIX: Removed pb-12 and fixed height, now using h-full to fit exactly inside the layout
    <div className="max-w-4xl mx-auto h-full flex flex-col pb-4">
      {/* Header Area (Fixed size, won't shrink) */}
      <div className="shrink-0">
        <Link href="/sandbox" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
          <span>←</span> Back to Sandbox
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center text-xl border border-pink-200 dark:border-pink-500/20">
              🧠
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contextual Memory AI</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Test short-term session memory. Tell it your name, ask another question, and then ask for your name again.
          </p>
        </div>
      </div>

      {/* Chat Box Area (Takes all remaining height, min-h-0 is the magic flexbox trick!) */}
      <div className="flex-1 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col shadow-sm overflow-hidden min-h-0">
        
        {/* Messages List (Scrolls independently) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 space-y-4">
              <div className="text-4xl">👋</div>
              <p>Start a conversation. I will remember what you say!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-200 rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-2xl rounded-bl-none px-5 py-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Fixed size at bottom) */}
        <div className="p-4 bg-slate-50 dark:bg-[#141414] border-t border-slate-200 dark:border-white/5 shrink-0">
          <form onSubmit={sendMessage} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              disabled={loading}
              className="w-full bg-white dark:bg-[#0a0a0a] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-6 py-4 rounded-xl focus:outline-none focus:border-blue-500/50 pr-24 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Send
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}