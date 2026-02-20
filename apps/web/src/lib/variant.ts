export { getVariant, getVariantConfig } from "@writeright/ai/shared/variant";
export type { Variant, VariantConfig } from "@writeright/ai/shared/variant";

import { getVariantConfig } from "@writeright/ai/shared/variant";

export interface WebVariantConfig {
  productName: string;
  metaTitle: string;
  metaDescription: string;
  authTagline: string;
  footerTagline: string;
  registerTagline: string;
  registerFeatures: { emoji: string; text: string }[];
  pricingComparison: string;
}

const SG_WEB: WebVariantConfig = {
  productName: "WriteRight SG",
  metaTitle: "WriteRight SG — AI Essay Feedback for Singapore Secondary School Students",
  metaDescription:
    "Get instant, MOE-aligned feedback on your English essays. Aligned to the 1184 syllabus with situational and continuous writing rubrics.",
  authTagline:
    "AI-powered marking aligned to Singapore's secondary school English syllabus. Get instant, specific feedback that helps you improve.",
  footerTagline: "Built for Singapore students.",
  registerTagline:
    "Join thousands of Singapore students improving their English essays with AI-powered feedback.",
  registerFeatures: [
    { emoji: "\u{1F4CA}", text: "MOE 1184 aligned scoring" },
    { emoji: "\u{270F}\u{FE0F}", text: "Built-in editor with AI coach" },
    { emoji: "\u{1F3C6}", text: "Achievement badges & rewards" },
    { emoji: "\u{1F4C8}", text: "Track improvement over time" },
  ],
  pricingComparison:
    "$14.90/month — that's the price of one bowl of laksa. One English tuition session costs $60\u2013120.",
};

const INTL_WEB: WebVariantConfig = {
  productName: "Sharpener",
  metaTitle: "Sharpener — AI Essay Feedback for English Students",
  metaDescription:
    "Get instant, rubric-aligned feedback on your English essays. Scored against Cambridge IGCSE criteria with situational and continuous writing support.",
  authTagline:
    "AI-powered marking aligned to Cambridge IGCSE English standards. Get instant, specific feedback that helps you improve.",
  footerTagline: "Sharpen your writing.",
  registerTagline:
    "Join thousands of students improving their English essays with AI-powered feedback.",
  registerFeatures: [
    { emoji: "\u{1F4CA}", text: "Cambridge IGCSE aligned scoring" },
    { emoji: "\u{270F}\u{FE0F}", text: "Built-in editor with AI coach" },
    { emoji: "\u{1F3C6}", text: "Achievement badges & rewards" },
    { emoji: "\u{1F4C8}", text: "Track improvement over time" },
  ],
  pricingComparison:
    "$14.90/month — less than the cost of a single tutoring session.",
};

export function getWebVariantConfig(): WebVariantConfig {
  const v = getVariantConfig();
  return v.variant === "international" ? INTL_WEB : SG_WEB;
}

export function brandedProductName(): string {
  return getVariantConfig().productName;
}
