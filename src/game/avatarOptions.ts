// All avatar customization options live here as plain data.
// The renderer (avatarRenderer.ts) only knows how to draw an *index* into
// these arrays — this is the seam where real sprite art can replace the
// procedural shapes later without touching any scene/UI logic.

export const SKIN_TONES: number[] = [
  0xffe0bd, 0xffcd94, 0xeac086, 0xc68642, 0x8d5524, 0x5c3a21,
];

export const HAIR_STYLES = ["bald", "short", "curly", "long", "spiky"] as const;
export type HairStyle = (typeof HAIR_STYLES)[number];

export const HAIR_COLORS: number[] = [
  0x1a1a1a, // black
  0x4a2c17, // brown
  0xd6b370, // blonde
  0xb33a1e, // red/ginger
  0x3b6ea5, // fun blue
  0xd66fae, // fun pink
];

export const SHIRT_COLORS: number[] = [
  0xe63946, 0xf4a261, 0xe9c46a, 0x2a9d8f, 0x264653, 0x9d4edd, 0xff70a6, 0x457b9d,
];

export const PANTS_COLORS: number[] = [
  0x2b2d42, 0x6d597a, 0x355070, 0x3a5a40, 0x774936, 0x1d3557,
];

export function cyclicIndex(current: number, delta: number, length: number): number {
  return (current + delta + length) % length;
}
