"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface ChatMessage {
  role: "ai" | "user";
  text: string;
  isLink?: boolean;
}

// 🔥 INNER COMPONENT (logic yahan)
function AIBookingPageInner() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get("lead_id");
  const leadName = searchParams.get("name") || "there";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: `Hi ${leadName}! I have your profile details pulled up from our system. I see you're interested in exploring how AgenticForge can help your enterprise. When would be a good time for a deep-dive call with our engineering team?`,
    },
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
    if (!input.trim() || !leadId) return;

    const userText = input;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lead_id: parseInt(leadId, 10),
          message: userText,
          history: [],
        }),
      });

      const data = await response.json();

      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);

      if (data.is_booked && data.meet_link) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: "ai",
              text: `🔗 ${data.meet_link}`,
              isLink: true,
            },
          ]);
        }, 1000);
      }
    } catch (error) {
      console.error("Error communicating with AI:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Oops! Connecting to my brain failed. Give me a second.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!leadId) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]">
        <div className="text-center p-8 bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-red-200 dark:border-red-900/30">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Invalid Booking Link
          </h2>
          <p className="text-slate-500">
            Please use the personalized link sent to your email.
          </p>
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
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-[#0a0a0a]">
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[75%] p-4 text-[15px] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                  : msg.isLink 
                    ? 'bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 font-medium rounded-2xl rounded-tl-sm'
                    : 'bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-2xl rounded-tl-sm whitespace-pre-wrap'
              }`}>
                {msg.isLink ? (
                  <a href={msg.text.split("🔗")[1]?.trim() || "#"} target="_blank" className="underline font-bold">
                    Join Google Meet 🎥
                  </a>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl shadow-sm">
                typing...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 bg-white dark:bg-[#111] border-t">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full border rounded-xl py-3 pl-4 pr-12"
              placeholder="Ask something..."
            />
            <button className="absolute right-2 bg-blue-600 text-white px-3 py-1 rounded-lg">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// 🔥 Suspense wrapper
export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading AI...</div>}>
      <AIBookingPageInner />
    </Suspense>
  );
}