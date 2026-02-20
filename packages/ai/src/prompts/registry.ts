import { getMarkingSwV1 } from "./v1/marking-sw-v1";
import { getMarkingCwV1 } from "./v1/marking-cw-v1";
import { getRewriteV1 } from "./v1/rewrite-v1";
import { getTopicGenV1 } from "./v1/topic-gen-v1";

type PromptTemplate = { system: string; user: string };

const PROMPT_GETTERS: Record<string, () => PromptTemplate> = {
  "marking-sw-v1": getMarkingSwV1,
  "marking-cw-v1": getMarkingCwV1,
  "rewrite-v1": getRewriteV1,
  "topic-gen-v1": getTopicGenV1,
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
  const getter = PROMPT_GETTERS[key];
  if (!getter) throw new Error(`Unknown prompt: ${key}`);
  const template = getter();
  return {
    system: interpolate(template.system, vars),
    user: interpolate(template.user, vars),
  };
}

export function listPrompts(): string[] {
  return Object.keys(PROMPT_GETTERS);
}
