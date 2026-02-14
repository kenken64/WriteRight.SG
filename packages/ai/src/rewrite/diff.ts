import { diffWords } from "diff";
import type { DiffChange } from "../shared/types";

export function computeDiff(original: string, rewritten: string): DiffChange[] {
  const changes = diffWords(original, rewritten);

  return changes.map((change) => ({
    type: change.added ? "add" : change.removed ? "remove" : "unchanged",
    value: change.value,
  }));
}

export function getDiffStats(diff: DiffChange[]) {
  const added = diff.filter((d) => d.type === "add");
  const removed = diff.filter((d) => d.type === "remove");
  const unchanged = diff.filter((d) => d.type === "unchanged");

  const addedWords = added.reduce((sum, d) => sum + d.value.split(/\s+/).filter(Boolean).length, 0);
  const removedWords = removed.reduce((sum, d) => sum + d.value.split(/\s+/).filter(Boolean).length, 0);
  const unchangedWords = unchanged.reduce((sum, d) => sum + d.value.split(/\s+/).filter(Boolean).length, 0);
  const totalOriginal = removedWords + unchangedWords;
  const changePercentage = totalOriginal > 0 ? ((addedWords + removedWords) / (totalOriginal * 2)) * 100 : 0;

  return { addedWords, removedWords, unchangedWords, changePercentage: Math.round(changePercentage) };
}
