import type { IconId } from "../game/iconRenderer";

// Tier 0 = pure audio→picture matching, zero reading required. This is
// content, not code — extending the word bank never touches game logic.
export interface WordEntry {
  word: string;
  icon: IconId;
}

export const TIER0_WORDS: WordEntry[] = [
  { word: "sun", icon: "sun" },
  { word: "star", icon: "star" },
  { word: "ball", icon: "ball" },
  { word: "cat", icon: "cat" },
  { word: "tree", icon: "tree" },
  { word: "fish", icon: "fish" },
  { word: "moon", icon: "moon" },
  { word: "apple", icon: "apple" },
];

// Returns `count` WordEntry options (shuffled) guaranteed to include the
// correct word exactly once.
export function pickDrillOptions(correctWord: string, count = 3): WordEntry[] {
  const correct = TIER0_WORDS.find((w) => w.word === correctWord);
  if (!correct) throw new Error(`Unknown Tier-0 word: ${correctWord}`);

  const others = TIER0_WORDS.filter((w) => w.word !== correctWord);
  const shuffledOthers = [...others].sort(() => Math.random() - 0.5).slice(0, count - 1);
  const options = [...shuffledOthers, correct];
  return options.sort(() => Math.random() - 0.5);
}
