"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'next/navigation'; // 🌟 Zaroori Import

interface ChatMessage {
  role: "ai" | "user";
  text: string;
  isLink?: boolean; // Agar meeting link aayi toh alag dikhayenge
}

export default function AIBookingPage() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('lead_id');
  const leadName = searchParams.get('name') || "there"; // Agar naam hai toh lo, warna "there"

  // 🌟 NAYA: Greeting message personalized by URL params
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: "ai", 
      text: `Hi ${leadName}! I have your profile details pulled up from our system. I see you're interested in exploring how AgenticForge can help your enterprise. When would be a good time for a deep-dive call with our engineering team?` 
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
    if (!input.trim() || !leadId) return; // 🌟 Agar ID nahi hai toh kuch mat kar

    const userText = input;
    // 1. Show user message instantly
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    try {
      // 2. Call our FastAPI RAG Backend
      const response = await fetch("http://127.0.0.1:8000/api/chat/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 🌟 Asli ID bhejo string se number banake
        body: JSON.stringify({ lead_id: parseInt(leadId, 10), message: userText, history: [] }),
      });

      const data = await response.json();

      // 3. Update chat with AI's reply
      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);

      // 4. Agar meeting book ho gayi, toh link alag se dikhao
      if (data.is_booked && data.meet_link) {
         setTimeout(() => {
             setMessages(prev => [...prev, { 
                 role: "ai", 
                 text: `🔗 ${data.meet_link}`, // 🌟 NAYA: Yahan message set theek se hoga
                 isLink: true 
             }]);
         }, 1000);
      }

    } catch (error) {
      console.error("Error communicating with AI:", error);
      setMessages(prev => [...prev, { role: "ai", text: "Oops! Connecting to my brain failed. Give me a second." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // 🌟 SECURITY CHECK: Agar URL mein ?lead_id= nahi hai, toh page access mat do!
  if (!leadId) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]">
            <div className="text-center p-8 bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-red-200 dark:border-red-900/30">
                <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Invalid Booking Link</h2>
                <p className="text-slate-500">Please use the personalized link sent to your email.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="h-[85vh] w-full max-w-4xl mx-auto flex flex-col pt-2 pb-6 font-sans overflow-hidden">
      
      {/* HEADER */}
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
          Ask me about AgenticForge or tell me when you&apos;re free for a call!
        </p>
      </div>

      {/* CHAT CARD */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden min-h-0">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-[#0a0a0a] 
          [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[75%] p-4 text-[15px] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                  : msg.isLink 
                    ? 'bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 font-medium rounded-2xl rounded-tl-sm'
                    : 'bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-2xl rounded-tl-sm whitespace-pre-wrap'
              }`}>
                {/* 🌟 NAYA: Updated Link Rendering Logic */}
                {msg.isLink ? (
                    <a href={msg.text.split("🔗")[1]?.trim() || "#"} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-600 dark:hover:text-green-300 font-bold">
                        Join Google Meet 🎥
                    </a>
                ) : (
                    msg.text
                )}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center h-[52px] shadow-sm">
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
              placeholder="Ask about pricing, services, or say 'Let's meet tomorrow at 10 AM'" 
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