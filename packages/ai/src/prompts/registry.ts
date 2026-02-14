import { MARKING_SW_V1 } from "./v1/marking-sw-v1";
import { MARKING_CW_V1 } from "./v1/marking-cw-v1";
import { REWRITE_V1 } from "./v1/rewrite-v1";
import { TOPIC_GEN_V1 } from "./v1/topic-gen-v1";

type PromptTemplate = { system: string; user: string };

const PROMPTS: Record<string, PromptTemplate> = {
  "marking-sw-v1": MARKING_SW_V1,
  "marking-cw-v1": MARKING_CW_V1,
  "rewrite-v1": REWRITE_V1,
  "topic-gen-v1": TOPIC_GEN_V1,
};

function interpolate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  // Handle conditional blocks {{#if key}}...{{/if}}
  result = result.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
    return vars[key] ? content : "";
  });
  return result;
}

export function getPrompt(key: string, vars: Record<string, string> = {}): { system: string; user: string } {
  const template = PROMPTS[key];
  if (!template) throw new Error(`Unknown prompt: ${key}`);
  return {
    system: interpolate(template.system, vars),
    user: interpolate(template.user, vars),
  };
}

export function listPrompts(): string[] {
  return Object.keys(PROMPTS);
}
