"use client";

import React, { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { AiSuggestionCard } from "./ai-suggestion-card";
import { AiChat } from "./ai-chat";
import { LiveScorePanel } from "./live-score-panel";

interface Suggestion {
  id: string;
  type: string;
  text: string;
  example?: string;
}

interface ChatMessage {
  role: "student" | "coach";
  content: string;
}

interface ScoreData {
  totalScore: number;
  maxScore: number;
  band: number;
  dimensions: { name: string; score: number; maxScore: number; status: string; details: string[] }[];
  nextBandTips: { dimension: string; tip: string; potentialGain: number }[];
}

interface ScoreHistoryPoint {
  paragraphCount: number;
  score: number;
  band: number;
  timestamp: number;
}

interface AiPanelProps {
  draftId: string;
  suggestions: Suggestion[];
  onAcceptSuggestion: (id: string) => void;
  onDismissSuggestion: (id: string) => void;
  suggestionsUsed: number;
  maxSuggestions?: number;
  chatMessages: ChatMessage[];
  onChatSend: (message: string) => Promise<void>;
  chatLoading?: boolean;
  scoreData: ScoreData | null;
  scoreHistory: ScoreHistoryPoint[];
  scoreLoading?: boolean;
  onMinimizeScore?: () => void;
  enabled?: boolean;
}

export function AiPanel({
  draftId,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  suggestionsUsed,
  maxSuggestions = 10,
  chatMessages,
  onChatSend,
  chatLoading,
  scoreData,
  scoreHistory,
  scoreLoading,
  onMinimizeScore,
  enabled = true,
}: AiPanelProps) {
  if (!enabled) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        <p>🔇 AI Assistant is off in Exam mode</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border-l border-gray-200 bg-gray-50/50">
      <div className="px-3 pt-3 pb-1">
        <h2 className="text-sm font-semibold text-gray-700">🤖 AI Writing Coach</h2>
      </div>

      <Tabs.Root defaultValue="suggestions" className="flex-1 flex flex-col min-h-0">
        <Tabs.List className="flex border-b border-gray-200 px-3 gap-1">
          {["suggestions", "chat", "score"].map((tab) => (
            <Tabs.Trigger
              key={tab}
              value={tab}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 border-b-2 border-transparent data-[state=active]:text-blue-600 data-[state=active]:border-blue-600 transition-colors capitalize"
            >
              {tab === "suggestions" ? `💡 Tips (${suggestionsUsed}/${maxSuggestions})` : tab === "chat" ? "💬 Chat" : "📊 Score"}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="suggestions" className="flex-1 overflow-y-auto p-3 space-y-2">
          {suggestions.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              Keep writing — suggestions will appear as you go!
            </p>
          ) : (
            suggestions.map((s) => (
              <AiSuggestionCard
                key={s.id}
                type={s.type}
                text={s.text}
                example={s.example}
                onAccept={() => onAcceptSuggestion(s.id)}
                onDismiss={() => onDismissSuggestion(s.id)}
              />
            ))
          )}
        </Tabs.Content>

        <Tabs.Content value="chat" className="flex-1 min-h-0">
          <AiChat
            draftId={draftId}
            messages={chatMessages}
            onSend={onChatSend}
            loading={chatLoading}
          />
        </Tabs.Content>

        <Tabs.Content value="score" className="flex-1 overflow-y-auto p-3">
          {scoreData ? (
            <LiveScorePanel
              totalScore={scoreData.totalScore}
              maxScore={scoreData.maxScore}
              band={scoreData.band}
              dimensions={scoreData.dimensions}
              nextBandTips={scoreData.nextBandTips}
              scoreHistory={scoreHistory}
              loading={scoreLoading}
              onMinimize={onMinimizeScore}
            />
          ) : (
            <p className="text-xs text-gray-400 text-center py-6">
              Write a paragraph to see your live score estimate.
            </p>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
