/**
 * Calculate target band for rewrite based on current performance.
 * Conservative: aim for +1 band, never skip bands.
 */

export function calculateTargetBand(currentBand: number): number {
  if (currentBand >= 5) return 5;
  return currentBand + 1;
}

export function getBandDescription(band: number): string {
  const descriptions: Record<number, string> = {
    1: "Below expectations — significant improvement needed in all areas",
    2: "Approaching expectations — basic competence shown, many areas to improve",
    3: "Meeting expectations — competent writing with room for growth",
    4: "Exceeding expectations — strong writing with minor areas to polish",
    5: "Outstanding — excellent command of language and content",
  };
  return descriptions[band] ?? "Unknown band";
}

export function getImprovementFocus(currentBand: number): string[] {
  const focusMap: Record<number, string[]> = {
    1: ["Basic grammar and spelling", "Sentence structure", "Addressing the prompt"],
    2: ["Paragraph organisation", "Vocabulary expansion", "Task fulfilment"],
    3: ["Vocabulary sophistication", "Transitions and flow", "Depth of analysis"],
    4: ["Stylistic flair", "Nuanced arguments", "Persuasive techniques"],
    5: ["Maintain excellence", "Explore creative approaches"],
  };
  return focusMap[currentBand] ?? focusMap[3];
}
