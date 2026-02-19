#!/usr/bin/env node

/**
 * Test OCR using OpenAI Vision model on a local PDF/image file.
 * PDFs are converted to per-page PNG images first (matching the app pipeline).
 * Zero external dependencies for images; uses pdf-to-png-converter for PDFs.
 *
 * Usage:
 *   node scripts/test-ocr-vision.mjs <file-path>
 *
 * Example:
 *   node scripts/test-ocr-vision.mjs ~/Downloads/Global_Perspectives_Day_Speech.pdf
 */

import fs from "node:fs";
import path from "node:path";

// ── Load env from .env.local files ─────────────────────────────────
const scriptDir = new URL(".", import.meta.url).pathname;
const envPaths = [
  path.resolve(scriptDir, "../apps/web/.env.local"),
  path.resolve(scriptDir, "../.env.local"),
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    }
  }
}

if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY not found in environment or .env.local");
  process.exit(1);
}

// ── Config ─────────────────────────────────────────────────────────
const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL_VISION ?? "gpt-4o";
const API_URL = "https://api.openai.com/v1/chat/completions";

const OCR_SYSTEM_PROMPT = `You are an OCR engine specialised in reading handwritten English essays by Singaporean secondary school students.
Convert the handwritten text to well-formatted Markdown. Preserve the document structure including:
- Paragraph breaks (use double newlines)
- Line breaks where the student intended them
- Headings (use ## for headings)
- Addresses, dates, salutations, and closings (preserve letter formatting)
- Crossed-out words (mark as ~~crossed out: word~~)
- Illegible words (mark as **[illegible]**)
- Spelling errors (preserve them exactly, do not correct)
Output only the Markdown-formatted transcription, no commentary.`;

// ── Helpers ────────────────────────────────────────────────────────
async function ocrImageBase64(imageBase64DataUrl, pageLabel) {
  const body = {
    model: MODEL,
    max_tokens: 4096,
    messages: [
      { role: "system", content: OCR_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageBase64DataUrl, detail: "high" } },
          { type: "text", text: `Transcribe ${pageLabel}. Convert to well-formatted Markdown.` },
        ],
      },
    ],
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return { text, usage: data.usage };
}

// ── Main ───────────────────────────────────────────────────────────
async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: node scripts/test-ocr-vision.mjs <file-path>");
    console.error("  e.g. node scripts/test-ocr-vision.mjs ~/Downloads/essay.pdf");
    process.exit(1);
  }

  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }

  const ext = path.extname(absPath).toLowerCase().slice(1);
  const fileData = fs.readFileSync(absPath);
  console.log(`\nFile:  ${absPath}`);
  console.log(`Size:  ${(fileData.length / 1024).toFixed(1)} KB`);
  console.log(`Model: ${MODEL}`);

  const start = Date.now();
  let fullText = "";
  let totalTokens = { prompt: 0, completion: 0, total: 0 };

  if (ext === "pdf") {
    // Convert PDF pages to PNG images, then OCR each
    const { pdf: pdfToImg } = await import(
      path.resolve(scriptDir, "../packages/ai/node_modules/pdf-to-img/dist/index.js")
    );

    console.log(`\nConverting PDF pages to images...`);
    const document = await pdfToImg(fileData, { scale: 2.0 });
    const pngPages = [];
    for await (const image of document) {
      pngPages.push(image);
    }
    console.log(`Converted to ${pngPages.length} page image(s)`);
    console.log(`Sending each page to OpenAI Vision API...\n`);

    const pageTexts = [];
    for (let i = 0; i < pngPages.length; i++) {
      const pageNum = i + 1;
      const imageBase64 = `data:image/png;base64,${pngPages[i].toString("base64")}`;
      const pageStart = Date.now();
      const { text, usage } = await ocrImageBase64(imageBase64, `page ${pageNum} of the handwritten essay`);
      const pageElapsed = ((Date.now() - pageStart) / 1000).toFixed(1);

      totalTokens.prompt += usage?.prompt_tokens ?? 0;
      totalTokens.completion += usage?.completion_tokens ?? 0;
      totalTokens.total += usage?.total_tokens ?? 0;

      console.log(`Page ${pageNum}: ${text.length} chars, ${pageElapsed}s (${usage?.total_tokens ?? "?"} tokens)`);
      pageTexts.push(text);
    }
    fullText = pageTexts.join("\n\n");
  } else {
    // Image file — send directly
    const mimeMap = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp" };
    const mime = mimeMap[ext];
    if (!mime) {
      console.error(`Unsupported file type: .${ext}`);
      process.exit(1);
    }

    const imageBase64 = `data:${mime};base64,${fileData.toString("base64")}`;
    console.log(`\nSending image to OpenAI Vision API...\n`);

    const { text, usage } = await ocrImageBase64(imageBase64, "the handwritten text from this image");
    fullText = text;
    totalTokens.prompt = usage?.prompt_tokens ?? 0;
    totalTokens.completion = usage?.completion_tokens ?? 0;
    totalTokens.total = usage?.total_tokens ?? 0;
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log("\n" + "=".repeat(60));
  console.log("OCR RESULT:");
  console.log("=".repeat(60));
  console.log(fullText);
  console.log("=".repeat(60));
  console.log(`\nDone in ${elapsed}s`);
  console.log(`Tokens - prompt: ${totalTokens.prompt}, completion: ${totalTokens.completion}, total: ${totalTokens.total}`);

  if (!fullText.trim()) {
    console.error("\nWARNING: Vision model returned empty text!");
    process.exit(1);
  }

  // Write output to file alongside the input
  const outPath = path.resolve(
    path.dirname(absPath),
    `${path.basename(absPath, path.extname(absPath))}_ocr_output.md`,
  );
  fs.writeFileSync(outPath, fullText, "utf-8");
  console.log(`Output saved to: ${outPath}`);
}

main();
