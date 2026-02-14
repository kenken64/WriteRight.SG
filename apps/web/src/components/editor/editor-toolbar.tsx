"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Undo2,
  Redo2,
  Send,
  Bot,
  BotOff,
} from "lucide-react";
import { WordCountBar } from "./word-count-bar";
import { ModeSelector, type WritingMode } from "./mode-selector";
import { DraftStatus, type SaveState } from "./draft-status";

interface EditorToolbarProps {
  editor: Editor | null;
  wordCount: number;
  wordMin: number;
  wordMax: number;
  mode: WritingMode;
  onModeChange: (mode: WritingMode) => void;
  aiEnabled: boolean;
  onToggleAi: () => void;
  onSubmit: () => void;
  saveState: SaveState;
  versionNumber?: number;
  submitting?: boolean;
}

function ToolBtn({
  active,
  onClick,
  disabled,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({
  editor,
  wordCount,
  wordMin,
  wordMax,
  mode,
  onModeChange,
  aiEnabled,
  onToggleAi,
  onSubmit,
  saveState,
  versionNumber,
  submitting,
}: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
      {/* Formatting */}
      <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2">
        <ToolBtn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </ToolBtn>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2">
        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </ToolBtn>
      </div>

      {/* Word Count */}
      <WordCountBar wordCount={wordCount} min={wordMin} max={wordMax} />

      <div className="flex-1" />

      {/* Draft Status */}
      <DraftStatus state={saveState} versionNumber={versionNumber} />

      {/* Mode Selector */}
      <ModeSelector value={mode} onChange={onModeChange} />

      {/* AI Toggle */}
      <button
        onClick={onToggleAi}
        disabled={mode === "exam"}
        title={aiEnabled ? "Disable AI Assistant" : "Enable AI Assistant"}
        className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
          aiEnabled
            ? "bg-purple-100 text-purple-700 border border-purple-200"
            : "bg-gray-100 text-gray-500 border border-gray-200"
        } ${mode === "exam" ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        {aiEnabled ? <Bot className="h-3.5 w-3.5" /> : <BotOff className="h-3.5 w-3.5" />}
        AI {aiEnabled ? "ON" : "OFF"}
      </button>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={submitting || wordCount < 10}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="h-3.5 w-3.5" />
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}
