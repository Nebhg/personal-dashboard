"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "How has my diet been this week?",
  "What habits need attention?",
  "Give me a workout suggestion for today.",
  "Summarize my progress this week.",
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(userMessage: string) {
    if (!userMessage.trim() || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMessage]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages([
          ...newMessages,
          { role: "assistant", content: `Error: ${err.error}` },
        ]);
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages([...newMessages, { role: "assistant", content: accumulated }]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: `Failed to connect to AI: ${err}` },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col h-[calc(100vh-2rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          AI Coach
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ask about your diet, workouts, habits, or get personalized advice
        </p>
      </div>

      <ScrollArea className="flex-1 border rounded-lg p-4 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Bot className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm font-medium">Your AI lifestyle coach</p>
            <p className="text-muted-foreground text-xs mt-1">
              Powered by your dashboard data
            </p>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <Card
                className={cn(
                  "max-w-[80%]",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <CardContent className="p-3 text-sm whitespace-pre-wrap">
                  {msg.content || (loading && i === messages.length - 1 ? "▌" : "")}
                </CardContent>
              </Card>
              {msg.role === "user" && (
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </ScrollArea>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs px-3 py-1.5 border rounded-full hover:bg-accent transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          placeholder="Ask your AI coach anything about your lifestyle..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          className="resize-none min-h-[44px] max-h-32"
          rows={1}
          disabled={loading}
        />
        <Button onClick={() => send(input)} disabled={loading || !input.trim()} className="shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
