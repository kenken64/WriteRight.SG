"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatMessage {
  role: "student" | "coach";
  content: string;
}

interface AiChatProps {
  draftId: string;
  messages: ChatMessage[];
  onSend: (message: string) => Promise<void>;
  maxMessages?: number;
  loading?: boolean;
}

export function AiChat({ draftId, messages, onSend, maxMessages = 15, loading = false }: AiChatProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const studentCount = messages.filter((m) => m.role === "student").length;
  const atLimit = studentCount >= maxMessages;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || atLimit) return;
    setInput("");
    await onSend(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 p-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">
            Ask your writing coach anything about your essay!
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "student" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "student"
                  ? "bg-blue-100 text-blue-900"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.role === "coach" && <span className="text-xs font-medium text-gray-500 block mb-0.5">🤖 Coach</span>}
              <p className="whitespace-pre-wrap select-none">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t p-2">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5 px-1">
          <span>{studentCount}/{maxMessages} messages used</span>
          {atLimit && <span className="text-amber-500 font-medium">Limit reached</span>}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={atLimit || loading}
            placeholder={atLimit ? "Chat limit reached" : "Ask your coach..."}
            className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:bg-gray-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || atLimit}
            className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
