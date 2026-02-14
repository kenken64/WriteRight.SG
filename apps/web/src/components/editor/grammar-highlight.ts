import { Mark, mergeAttributes } from "@tiptap/react";

export interface GrammarMarkAttrs {
  category: "grammar" | "spelling" | "vocabulary" | "style" | "passive_voice";
  suggestion: string;
  explanation: string;
  annotationId: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  grammar: "rgba(239, 68, 68, 0.4)",      // red
  spelling: "rgba(239, 68, 68, 0.4)",      // red dotted
  vocabulary: "rgba(234, 179, 8, 0.4)",    // yellow
  style: "rgba(249, 115, 22, 0.4)",        // orange
  passive_voice: "rgba(59, 130, 246, 0.4)", // blue
};

const CATEGORY_STYLES: Record<string, string> = {
  grammar: "wavy",
  spelling: "dotted",
  vocabulary: "wavy",
  style: "wavy",
  passive_voice: "wavy",
};

export const GrammarHighlight = Mark.create<{}, GrammarMarkAttrs>({
  name: "grammarHighlight",

  addAttributes() {
    return {
      category: { default: "grammar" },
      suggestion: { default: "" },
      explanation: { default: "" },
      annotationId: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-grammar-highlight]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const category = HTMLAttributes.category || "grammar";
    const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.grammar;
    const style = CATEGORY_STYLES[category] || "wavy";

    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-grammar-highlight": category,
        "data-suggestion": HTMLAttributes.suggestion,
        "data-explanation": HTMLAttributes.explanation,
        "data-annotation-id": HTMLAttributes.annotationId,
        style: `text-decoration: underline ${style} ${color}; text-underline-offset: 3px; cursor: help;`,
        title: `${HTMLAttributes.suggestion} — ${HTMLAttributes.explanation}`,
      }),
      0,
    ];
  },
});

export default GrammarHighlight;
