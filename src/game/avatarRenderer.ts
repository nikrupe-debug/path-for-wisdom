import Phaser from "phaser";
import type { AvatarConfig } from "../types/avatar";
import { SKIN_TONES, HAIR_COLORS, SHIRT_COLORS, PANTS_COLORS } from "./avatarOptions";

// Procedural chibi-style avatar, drawn entirely with Phaser Graphics — no
// external art files needed for the MVP. Swapping this out for a real
// layered sprite sheet later only means rewriting this one function; the
// AvatarConfig data model and every scene that consumes it stay the same.

const HEAD_R = 24;
const HEAD_Y = -46;
const TORSO_TOP = -20;
const TORSO_BOTTOM = 28;
const TORSO_HALF_W = 20;
const LEG_TOP = 28;
const LEG_BOTTOM = 62;
const OUTLINE = 0x2b2118;

export function drawAvatar(scene: Phaser.Scene, container: Phaser.GameObjects.Container, config: AvatarConfig): void {
  container.removeAll(true);

  const skin = SKIN_TONES[config.skinToneIndex] ?? SKIN_TONES[0];
  const hairColor = HAIR_COLORS[config.hairColorIndex] ?? HAIR_COLORS[0];
  const shirt = SHIRT_COLORS[config.shirtColorIndex] ?? SHIRT_COLORS[0];
  const pants = PANTS_COLORS[config.pantsColorIndex] ?? PANTS_COLORS[0];

  const g = scene.add.graphics();

  // --- legs ---
  g.fillStyle(pants, 1);
  g.fillRoundedRect(-TORSO_HALF_W + 2, LEG_TOP, 14, LEG_BOTTOM - LEG_TOP, 4);
  g.fillRoundedRect(TORSO_HALF_W - 16, LEG_TOP, 14, LEG_BOTTOM - LEG_TOP, 4);
  g.lineStyle(2, OUTLINE, 1);
  g.strokeRoundedRect(-TORSO_HALF_W + 2, LEG_TOP, 14, LEG_BOTTOM - LEG_TOP, 4);
  g.strokeRoundedRect(TORSO_HALF_W - 16, LEG_TOP, 14, LEG_BOTTOM - LEG_TOP, 4);

  // --- shoes ---
  g.fillStyle(0x2b2118, 1);
  g.fillRoundedRect(-TORSO_HALF_W, LEG_BOTTOM - 4, 18, 10, 3);
  g.fillRoundedRect(TORSO_HALF_W - 18, LEG_BOTTOM - 4, 18, 10, 3);

  // --- arms (behind torso) ---
  g.fillStyle(skin, 1);
  g.fillRoundedRect(-TORSO_HALF_W - 10, TORSO_TOP + 4, 12, 34, 6);
  g.fillRoundedRect(TORSO_HALF_W - 2, TORSO_TOP + 4, 12, 34, 6);
  g.lineStyle(2, OUTLINE, 1);
  g.strokeRoundedRect(-TORSO_HALF_W - 10, TORSO_TOP + 4, 12, 34, 6);
  g.strokeRoundedRect(TORSO_HALF_W - 2, TORSO_TOP + 4, 12, 34, 6);

  // --- torso / shirt ---
  g.fillStyle(shirt, 1);
  g.fillRoundedRect(-TORSO_HALF_W, TORSO_TOP, TORSO_HALF_W * 2, TORSO_BOTTOM - TORSO_TOP, 8);
  g.lineStyle(2, OUTLINE, 1);
  g.strokeRoundedRect(-TORSO_HALF_W, TORSO_TOP, TORSO_HALF_W * 2, TORSO_BOTTOM - TORSO_TOP, 8);

  // --- head ---
  g.fillStyle(skin, 1);
  g.fillCircle(0, HEAD_Y, HEAD_R);
  g.lineStyle(2, OUTLINE, 1);
  g.strokeCircle(0, HEAD_Y, HEAD_R);

  // --- face ---
  g.fillStyle(0x2b2118, 1);
  g.fillCircle(-8, HEAD_Y - 2, 2.5);
  g.fillCircle(8, HEAD_Y - 2, 2.5);
  g.lineStyle(2, 0x2b2118, 1);
  g.beginPath();
  g.arc(0, HEAD_Y + 4, 9, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false);
  g.strokePath();

  // --- hair ---
  drawHair(g, config.hairStyleIndex, hairColor);

  container.add(g);
}

function drawHair(g: Phaser.GameObjects.Graphics, styleIndex: number, color: number): void {
  const style = ["bald", "short", "curly", "long", "spiky"][styleIndex] ?? "short";
  g.fillStyle(color, 1);
  g.lineStyle(2, OUTLINE, 1);

  switch (style) {
    case "bald":
      // just a small shine highlight, no hair mass
      g.fillStyle(0xffffff, 0.25);
      g.fillCircle(-6, HEAD_Y - 10, 4);
      break;

    case "short":
      g.fillStyle(color, 1);
      g.slice(0, HEAD_Y, HEAD_R + 3, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
      g.fillPath();
      g.strokePath();
      break;

    case "curly":
      g.fillStyle(color, 1);
      for (const [dx, dy] of [
        [-16, -14], [-4, -20], [8, -20], [17, -13], [-8, -10], [8, -10], [0, -18],
      ]) {
        g.fillCircle(dx, HEAD_Y + dy, 8);
      }
      break;

    case "long":
      g.fillStyle(color, 1);
      g.slice(0, HEAD_Y, HEAD_R + 3, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
      g.fillPath();
      g.fillRoundedRect(-HEAD_R - 3, HEAD_Y - 6, 10, 40, 4);
      g.fillRoundedRect(HEAD_R - 7, HEAD_Y - 6, 10, 40, 4);
      break;

    case "spiky":
      g.fillStyle(color, 1);
      for (const dx of [-16, -8, 0, 8, 16]) {
        g.beginPath();
        g.moveTo(dx - 7, HEAD_Y - 14);
        g.lineTo(dx + 7, HEAD_Y - 14);
        g.lineTo(dx, HEAD_Y - 34);
        g.closePath();
        g.fillPath();
      }
      break;
  }
}
