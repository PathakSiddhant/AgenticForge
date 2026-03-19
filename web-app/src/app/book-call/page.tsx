"use client";

import React, { useState, useEffect, useRef } from "react";

interface ChatMessage {
  role: "ai" | "user";
  text: string;
}

export default function AIBookingPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: "ai", 
      text: "Hi there! I am the AgenticForge AI. I see you're ready to explore an enterprise AI architecture. What day works best for a 30-minute deep-dive call?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { role: "ai", text: "I have checked our calendar. Does 2:00 PM (IST) on that day work for you?" }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    // 🌟 THE ULTIMATE FIX: h-[85vh] ensures it NEVER overflows the global layout
    <div className="h-[85vh] w-full max-w-4xl mx-auto flex flex-col pt-2 pb-6 font-sans overflow-hidden">
      
      {/* 🌟 TITLE AREA */}
      <div className="flex-none text-center mb-5 mt-2">
        <div className="inline-flex items-center justify-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm text-white shadow-md">
            AF
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Schedule Consultation
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Chat with our autonomous agent to securely lock in a meeting time.
        </p>
      </div>

      {/* 🌟 THE CHAT CARD */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden min-h-0">
        
        {/* Chat Area (Inner Scroll Only) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-[#0a0a0a] 
          [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[75%] p-4 text-[15px] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-2xl rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center h-13 shadow-sm">
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} className="h-2" />
        </div>

        {/* Input Area */}
        <div className="flex-none p-4 bg-white dark:bg-[#111] border-t border-slate-200 dark:border-white/10">
          <form onSubmit={handleSend} className="relative max-w-3xl mx-auto flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 'Tomorrow at 10 AM' or 'Next Monday'" 
              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-300 dark:border-white/10 rounded-xl py-3.5 pl-4 pr-14 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
              autoFocus
              disabled={isTyping}
              autoComplete="off"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all disabled:opacity-0 shadow-md cursor-pointer"
            >
              <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">
              Powered by AgenticForge Intelligence
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}