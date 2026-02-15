import OpenAI from "openai";
import { MODEL_PRIMARY } from "./model-config";

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 2,
      timeout: 60_000,
    });
  }
  return _client;
}

export async function chatCompletion(
  systemPrompt: string,
  userPrompt: string,
  options: { model?: string; temperature?: number; maxTokens?: number; jsonMode?: boolean } = {}
): Promise<string> {
  const client = getOpenAIClient();
  const { model = MODEL_PRIMARY, temperature = 0.3, maxTokens = 4096, jsonMode = false } = options;

  const response = await client.chat.completions.create({
    model,
    temperature,
    max_tokens: maxTokens,
    response_format: jsonMode ? { type: "json_object" } : undefined,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}

export async function visionCompletion(
  systemPrompt: string,
  imageUrls: string[],
  userPrompt: string,
  options: { model?: string; maxTokens?: number } = {}
): Promise<string> {
  const client = getOpenAIClient();
  const { model = MODEL_PRIMARY, maxTokens = 4096 } = options;

  const imageContent = imageUrls.map((url) => ({
    type: "image_url" as const,
    image_url: { url, detail: "high" as const },
  }));

  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [...imageContent, { type: "text" as const, text: userPrompt }],
      },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}
