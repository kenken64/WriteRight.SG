export interface RubricDimension {
  name: string;
  maxScore: number;
  bands: { band: number; minScore: number; maxScore: number; descriptors: string[] }[];
}

export interface Rubric {
  version: string;
  essayType: "situational";
  subType?: string;
  dimensions: RubricDimension[];
  totalMaxScore: number;
}

const BASE_SITUATIONAL_RUBRIC: Rubric = {
  version: "v1.0",
  essayType: "situational",
  totalMaxScore: 30,
  dimensions: [
    {
      name: "Task Fulfilment",
      maxScore: 10,
      bands: [
        { band: 5, minScore: 9, maxScore: 10, descriptors: ["All points addressed fully", "Appropriate tone and register", "Convincing and engaging"] },
        { band: 4, minScore: 7, maxScore: 8, descriptors: ["Most points addressed", "Generally appropriate tone", "Clear purpose"] },
        { band: 3, minScore: 5, maxScore: 6, descriptors: ["Some points addressed", "Inconsistent tone", "Basic purpose evident"] },
        { band: 2, minScore: 3, maxScore: 4, descriptors: ["Few points addressed", "Inappropriate tone at times", "Unclear purpose"] },
        { band: 1, minScore: 0, maxScore: 2, descriptors: ["Points largely ignored", "Wrong format/tone", "No clear purpose"] },
      ],
    },
    {
      name: "Language & Style",
      maxScore: 10,
      bands: [
        { band: 5, minScore: 9, maxScore: 10, descriptors: ["Sophisticated vocabulary", "Varied sentence structures", "Minimal errors"] },
        { band: 4, minScore: 7, maxScore: 8, descriptors: ["Good vocabulary range", "Some sentence variety", "Few errors"] },
        { band: 3, minScore: 5, maxScore: 6, descriptors: ["Adequate vocabulary", "Basic sentence structures", "Some errors"] },
        { band: 2, minScore: 3, maxScore: 4, descriptors: ["Limited vocabulary", "Simple sentences", "Frequent errors"] },
        { band: 1, minScore: 0, maxScore: 2, descriptors: ["Very limited vocabulary", "Fragmented sentences", "Pervasive errors"] },
      ],
    },
    {
      name: "Organisation & Coherence",
      maxScore: 10,
      bands: [
        { band: 5, minScore: 9, maxScore: 10, descriptors: ["Excellent structure", "Smooth transitions", "Logical flow throughout"] },
        { band: 4, minScore: 7, maxScore: 8, descriptors: ["Clear structure", "Adequate transitions", "Generally logical"] },
        { band: 3, minScore: 5, maxScore: 6, descriptors: ["Basic structure", "Some transitions", "Mostly logical"] },
        { band: 2, minScore: 3, maxScore: 4, descriptors: ["Weak structure", "Few transitions", "Sometimes illogical"] },
        { band: 1, minScore: 0, maxScore: 2, descriptors: ["No clear structure", "No transitions", "Illogical"] },
      ],
    },
  ],
};

const SUBTYPES: Record<string, Partial<Rubric>> = {
  letter: { subType: "letter" },
  email: { subType: "email" },
  report: { subType: "report" },
  speech: { subType: "speech" },
  proposal: { subType: "proposal" },
};

export function getSituationalRubric(subType?: string): Rubric {
  const base = { ...BASE_SITUATIONAL_RUBRIC };
  if (subType && SUBTYPES[subType]) {
    base.subType = subType;
  }
  return base;
}
