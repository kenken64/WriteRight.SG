import type { RubricDimension, Rubric as SituationalRubric } from "./situational";

export interface ContinuousRubric {
  version: string;
  essayType: "continuous";
  subType?: string;
  dimensions: RubricDimension[];
  totalMaxScore: number;
}

const BASE_CONTINUOUS_RUBRIC: ContinuousRubric = {
  version: "v1.0",
  essayType: "continuous",
  totalMaxScore: 30,
  dimensions: [
    {
      name: "Content & Development",
      maxScore: 10,
      bands: [
        { band: 5, minScore: 9, maxScore: 10, descriptors: ["Rich, original ideas", "Well-developed arguments", "Excellent examples"] },
        { band: 4, minScore: 7, maxScore: 8, descriptors: ["Good ideas", "Developed arguments", "Relevant examples"] },
        { band: 3, minScore: 5, maxScore: 6, descriptors: ["Adequate ideas", "Some development", "Basic examples"] },
        { band: 2, minScore: 3, maxScore: 4, descriptors: ["Limited ideas", "Underdeveloped", "Few examples"] },
        { band: 1, minScore: 0, maxScore: 2, descriptors: ["No clear ideas", "No development", "No examples"] },
      ],
    },
    {
      name: "Language & Expression",
      maxScore: 10,
      bands: [
        { band: 5, minScore: 9, maxScore: 10, descriptors: ["Sophisticated expression", "Precise vocabulary", "Stylistic flair"] },
        { band: 4, minScore: 7, maxScore: 8, descriptors: ["Effective expression", "Good vocabulary", "Some style"] },
        { band: 3, minScore: 5, maxScore: 6, descriptors: ["Competent expression", "Adequate vocabulary", "Basic style"] },
        { band: 2, minScore: 3, maxScore: 4, descriptors: ["Weak expression", "Limited vocabulary", "No style"] },
        { band: 1, minScore: 0, maxScore: 2, descriptors: ["Poor expression", "Very limited vocabulary", "Incomprehensible at times"] },
      ],
    },
    {
      name: "Organisation & Structure",
      maxScore: 10,
      bands: [
        { band: 5, minScore: 9, maxScore: 10, descriptors: ["Masterful structure", "Compelling introduction and conclusion", "Seamless flow"] },
        { band: 4, minScore: 7, maxScore: 8, descriptors: ["Effective structure", "Good intro/conclusion", "Smooth flow"] },
        { band: 3, minScore: 5, maxScore: 6, descriptors: ["Clear structure", "Adequate intro/conclusion", "Basic flow"] },
        { band: 2, minScore: 3, maxScore: 4, descriptors: ["Unclear structure", "Weak intro/conclusion", "Disjointed"] },
        { band: 1, minScore: 0, maxScore: 2, descriptors: ["No structure", "No intro/conclusion", "Incoherent"] },
      ],
    },
  ],
};

export function getContinuousRubric(subType?: string): ContinuousRubric {
  return { ...BASE_CONTINUOUS_RUBRIC, subType: subType ?? undefined };
}
