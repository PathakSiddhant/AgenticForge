"use client";

import { PaperPlaneRightIcon, VideoCameraIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  role: "ai" | "user";
  text: string;
  isLink?: boolean;
}

function AIBookingPageInner() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get("lead_id");
  const leadName = searchParams.get("name") || "there";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: `Hi ${leadName}! I have your profile pulled up from our system. When would be a good time for a deep-dive call with our engineering team?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !leadId) return;

    const userText = input;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: parseInt(leadId, 10), message: userText, history: [] }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);

      if (data.is_booked && data.meet_link) {
        setTimeout(() => {
          setMessages((prev) => [...prev, { role: "ai", text: data.meet_link, isLink: true }]);
        }, 1000);
      }
    } catch (error) {
      console.error("Error communicating with AI:", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Connection error - please try again in a moment." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!leadId) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="max-w-sm rounded-lg border border-danger/20 bg-surface p-8 text-center">
          <WarningCircleIcon className="mx-auto mb-3 size-8 text-danger" weight="fill" />
          <h2 className="mb-1.5 text-lg font-semibold text-ink">Invalid booking link</h2>
          <p className="text-sm text-ink-muted">Please use the personalized link sent to your email.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden px-4 pt-8 pb-6 sm:px-6 lg:px-8">
      <div className="mb-5 mt-2 flex-none text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Schedule a Consultation</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Ask about AgenticForge or tell me when you&apos;re free for a call.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-background">
        <div className="flex-1 space-y-5 overflow-y-auto custom-scrollbar bg-surface p-5">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg p-3.5 text-sm leading-relaxed shadow-sm md:max-w-[75%] ${
                  msg.role === "user"
                    ? "bg-accent text-white"
                    : msg.isLink
                      ? "border border-success/20 bg-success-tint font-medium text-success"
                      : "whitespace-pre-wrap border border-border bg-background text-ink"
                }`}
              >
                {msg.isLink ? (
                  <a href={msg.text} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 underline">
                    <VideoCameraIcon weight="fill" /> Join Google Meet
                  </a>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background p-3.5">
                <span className="size-1.5 animate-bounce rounded-full bg-ink-subtle" />
                <span className="size-1.5 animate-bounce rounded-full bg-ink-subtle [animation-delay:0.15s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-ink-subtle [animation-delay:0.3s]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="border-t border-border bg-background p-3">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              disabled={isTyping}
            />
            <Button type="submit" size="icon" disabled={isTyping || !input.trim()} aria-label="Send">
              <PaperPlaneRightIcon weight="fill" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-sm text-ink-muted">Loading...</div>
      }
    >
      <AIBookingPageInner />
    </Suspense>
  );
}
