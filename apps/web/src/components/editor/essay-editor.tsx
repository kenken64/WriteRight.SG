"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import UnderlineExt from "@tiptap/extension-underline";
import { GrammarHighlight } from "./grammar-highlight";
import { EditorToolbar } from "./editor-toolbar";
import { AiPanel } from "./ai-panel";
import { Timer } from "./timer";
import { StructureTracker } from "./structure-tracker";
import type { WritingMode } from "./mode-selector";
import type { SaveState } from "./draft-status";

interface EssayEditorProps {
  draftId: string;
  assignmentId: string;
  assignmentPrompt: string;
  essayType: "situational" | "continuous";
  initialContent?: string;
  initialMode?: WritingMode;
  wordMin?: number;
  wordMax?: number;
  timerMinutes?: number;
  initialVersionNumber?: number;
}

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

interface StructureSection {
  label: string;
  detected: boolean;
}

async function apiFetch(url: string, opts?: RequestInit) {
  const res = await fetch(url, { ...opts, headers: { "Content-Type": "application/json", ...opts?.headers } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function EssayEditor({
  draftId,
  assignmentId,
  assignmentPrompt,
  essayType,
  initialContent = "",
  initialMode = "practice",
  wordMin = 300,
  wordMax = 400,
  timerMinutes,
  initialVersionNumber = 1,
}: EssayEditorProps) {
  const [mode, setMode] = useState<WritingMode>(initialMode);
  const [aiEnabled, setAiEnabled] = useState(mode !== "exam");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [versionNumber, setVersionNumber] = useState(initialVersionNumber);
  const [submitting, setSubmitting] = useState(false);
  const [mobileAiOpen, setMobileAiOpen] = useState(false);

  // AI state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsUsed, setSuggestionsUsed] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryPoint[]>([]);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [structure, setStructure] = useState<StructureSection[]>([]);

  // Refs for debouncing
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const suggestionTimer = useRef<NodeJS.Timeout | null>(null);
  const grammarTimer = useRef<NodeJS.Timeout | null>(null);
  const lastParagraphCount = useRef(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      CharacterCount,
      Placeholder.configure({ placeholder: "Start writing your essay here..." }),
      GrammarHighlight,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] px-6 py-4",
      },
    },
    onUpdate: ({ editor }) => {
      handleEditorUpdate(editor.getText(), editor.getHTML());
    },
  });

  const wordCount = editor?.storage.characterCount?.words() ?? 0;

  // Auto-save (30s debounce)
  const autoSave = useCallback(
    async (html: string, plainText: string) => {
      try {
        setSaveState("saving");
        const data = await apiFetch(`/api/v1/drafts/${draftId}`, {
          method: "PUT",
          body: JSON.stringify({ content: html, plain_text: plainText, word_count: plainText.split(/\s+/).filter(Boolean).length }),
        });
        setVersionNumber(data.version_number ?? versionNumber + 1);
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } catch {
        setSaveState("error");
      }
    },
    [draftId, versionNumber]
  );

  // Trigger suggestion
  const triggerSuggestion = useCallback(
    async (text: string) => {
      if (!aiEnabled || mode === "exam" || suggestionsUsed >= 10) return;
      try {
        const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
        const data = await apiFetch(`/api/v1/drafts/${draftId}/ai/suggest`, {
          method: "POST",
          body: JSON.stringify({
            text,
            currentParagraph: paragraphs[paragraphs.length - 1] ?? "",
            cursorParagraphIndex: paragraphs.length - 1,
          }),
        });
        if (data.type && data.text) {
          setSuggestions((prev) => [{ id: crypto.randomUUID(), ...data }, ...prev].slice(0, 5));
        }
      } catch {}
    },
    [draftId, aiEnabled, mode, suggestionsUsed]
  );

  // Trigger grammar check
  const triggerGrammar = useCallback(
    async (text: string) => {
      if (!aiEnabled || mode === "exam") return;
      try {
        await apiFetch(`/api/v1/drafts/${draftId}/ai/grammar`, {
          method: "POST",
          body: JSON.stringify({ text }),
        });
      } catch {}
    },
    [draftId, aiEnabled, mode]
  );

  // Trigger live score on new paragraph
  const triggerLiveScore = useCallback(
    async (text: string) => {
      if (!aiEnabled || mode === "exam") return;
      setScoreLoading(true);
      try {
        const data = await apiFetch(`/api/v1/drafts/${draftId}/ai/live-score`, {
          method: "POST",
          body: JSON.stringify({ text }),
        });
        setScoreData({
          totalScore: data.totalScore,
          maxScore: data.maxScore,
          band: data.band,
          dimensions: data.dimensions ?? [],
          nextBandTips: data.nextBandTips ?? [],
        });
        setScoreHistory((prev) => [
          ...prev,
          { paragraphCount: data.paragraphCount, score: data.totalScore, band: data.band, timestamp: Date.now() },
        ]);
      } catch {}
      setScoreLoading(false);
    },
    [draftId, aiEnabled, mode]
  );

  // Main update handler
  const handleEditorUpdate = useCallback(
    (plainText: string, html: string) => {
      // Auto-save (30s debounce)
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => autoSave(html, plainText), 30_000);

      // Suggestion (15s debounce)
      if (suggestionTimer.current) clearTimeout(suggestionTimer.current);
      suggestionTimer.current = setTimeout(() => triggerSuggestion(plainText), 15_000);

      // Grammar (5s debounce)
      if (grammarTimer.current) clearTimeout(grammarTimer.current);
      grammarTimer.current = setTimeout(() => triggerGrammar(plainText), 5_000);

      // Live score on new paragraph
      const paragraphs = plainText.split(/\n\s*\n/).filter(Boolean);
      if (paragraphs.length > lastParagraphCount.current && paragraphs.length >= 2) {
        triggerLiveScore(plainText);
      }
      lastParagraphCount.current = paragraphs.length;

      // Local structure detection
      setStructure([
        { label: "Intro", detected: paragraphs.length >= 1 },
        { label: "Body 1", detected: paragraphs.length >= 2 },
        { label: "Body 2", detected: paragraphs.length >= 3 },
        { label: "Conclusion", detected: paragraphs.length >= 4 },
      ]);
    },
    [autoSave, triggerSuggestion, triggerGrammar, triggerLiveScore]
  );

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      if (suggestionTimer.current) clearTimeout(suggestionTimer.current);
      if (grammarTimer.current) clearTimeout(grammarTimer.current);
    };
  }, []);

  // Mode change
  const handleModeChange = (newMode: WritingMode) => {
    setMode(newMode);
    if (newMode === "exam") setAiEnabled(false);
    else setAiEnabled(true);
  };

  // Chat
  const handleChatSend = async (message: string) => {
    setChatMessages((prev) => [...prev, { role: "student", content: message }]);
    setChatLoading(true);
    try {
      const data = await apiFetch(`/api/v1/drafts/${draftId}/ai/chat`, {
        method: "POST",
        body: JSON.stringify({ message, history: chatMessages }),
      });
      setChatMessages((prev) => [...prev, { role: "coach", content: data.response }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "coach", content: "Sorry, I couldn't respond. Try again!" }]);
    }
    setChatLoading(false);
  };

  // Suggestion actions
  const handleAcceptSuggestion = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    setSuggestionsUsed((prev) => prev + 1);
  };
  const handleDismissSuggestion = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  // Submit
  const handleSubmit = async () => {
    if (!editor) return;
    setSubmitting(true);
    try {
      // Save first
      await autoSave(editor.getHTML(), editor.getText());
      await apiFetch(`/api/v1/drafts/${draftId}/submit`, { method: "POST" });
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <EditorToolbar
        editor={editor}
        wordCount={wordCount}
        wordMin={wordMin}
        wordMax={wordMax}
        mode={mode}
        onModeChange={handleModeChange}
        aiEnabled={aiEnabled}
        onToggleAi={() => mode !== "exam" && setAiEnabled(!aiEnabled)}
        onSubmit={handleSubmit}
        saveState={saveState}
        versionNumber={versionNumber}
        submitting={submitting}
      />

      {/* Timer + Structure */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
        {(mode === "timed" || mode === "exam") && timerMinutes && (
          <Timer durationMinutes={timerMinutes} onTimeUp={handleSubmit} autoStart={mode === "exam"} />
        )}
        <StructureTracker sections={structure} />
      </div>

      {/* Editor + AI Panel */}
      <div className="flex flex-1 flex-col md:flex-row min-h-0">
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>

        {/* Mobile AI toggle button */}
        {aiEnabled && (
          <button
            onClick={() => setMobileAiOpen(!mobileAiOpen)}
            className="fixed bottom-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg md:hidden"
            aria-label="Toggle AI panel"
          >
            🤖
          </button>
        )}

        {aiEnabled && (
          <div className={`${mobileAiOpen ? 'block' : 'hidden'} md:block w-full md:w-80 flex-shrink-0 overflow-hidden border-t md:border-t-0 md:border-l max-h-[50vh] md:max-h-none`}>
            <AiPanel
              draftId={draftId}
              suggestions={suggestions}
              onAcceptSuggestion={handleAcceptSuggestion}
              onDismissSuggestion={handleDismissSuggestion}
              suggestionsUsed={suggestionsUsed}
              chatMessages={chatMessages}
              onChatSend={handleChatSend}
              chatLoading={chatLoading}
              scoreData={scoreData}
              scoreHistory={scoreHistory}
              scoreLoading={scoreLoading}
              enabled={aiEnabled}
            />
          </div>
        )}
      </div>
    </div>
  );
}
