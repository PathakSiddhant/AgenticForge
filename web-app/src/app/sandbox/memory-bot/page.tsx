"use client";

import { PaperPlaneRightIcon } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";

import { AgentHeader } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "memory-bot")!;

type Message = { role: "user" | "model"; content: string };

export default function MemoryBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input } as Message];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: messages, message: input }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "model", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", content: "The AI couldn't process that - try rephrasing." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Connection error. Is ai-engine running?" },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col px-4 pt-8 pb-4 sm:px-6 lg:px-8">
      <div className="shrink-0">
        <AgentHeader
          icon={agent.icon}
          title={agent.name}
          description="Tell it your name, ask another question, then ask for your name again - it remembers within this session."
          backHref="/sandbox"
          backLabel="Back to Sandbox"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-background">
        <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar p-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-ink-subtle">
              <p className="text-sm">Start a conversation - it will remember what you say.</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-5 py-3 text-sm ${msg.role === "user" ? "bg-accent text-white" : "border border-border bg-surface text-ink"}`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-lg border border-border bg-surface px-5 py-4">
                <span className="size-2 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
                <span className="size-2 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
                <span className="size-2 animate-bounce rounded-full bg-accent" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 border-t border-border bg-surface p-4">
          <form onSubmit={sendMessage} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send">
              <PaperPlaneRightIcon weight="fill" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
