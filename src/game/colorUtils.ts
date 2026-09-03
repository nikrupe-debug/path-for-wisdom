import Phaser from "phaser";

// Shared lighten/darken helpers so every renderer can fake simple cel-shading
// (a lighter "highlight" face + a darker "shadow" edge) instead of flat
// single-color fills — this is most of what separates "clip-art" from
// "game asset" at this level of procedural art, without needing real sprites.
export function lighten(color: number, amount: number): number {
  const c = Phaser.Display.Color.IntegerToColor(color);
  const r = Math.min(255, c.red + (255 - c.red) * amount);
  const g = Math.min(255, c.green + (255 - c.green) * amount);
  const b = Math.min(255, c.blue + (255 - c.blue) * amount);
  return Phaser.Display.Color.GetColor(r, g, b);
}

export function darken(color: number, amount: number): number {
  const c = Phaser.Display.Color.IntegerToColor(color);
  return Phaser.Display.Color.GetColor(c.red * (1 - amount), c.green * (1 - amount), c.blue * (1 - amount));
}
