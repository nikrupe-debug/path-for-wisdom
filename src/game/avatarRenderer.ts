import Phaser from "phaser";
import type { AvatarConfig } from "../types/avatar";
import { SKIN_TONES, HAIR_COLORS, SHIRT_COLORS, PANTS_COLORS } from "./avatarOptions";
import { lighten, darken } from "./colorUtils";

// Procedural side-profile avatar, drawn entirely with Phaser Graphics — no
// external art files needed for the MVP. Faces right by default (the scene
// flips the whole container via scaleX to face left); classic 2D-platformer
// convention is a profile character, not a mirrored front-facing one, so the
// head/face here are drawn asymmetrically on purpose. Every solid shape gets
// a light/dark shading pass (gradient fill or a highlight+shadow overlay)
// instead of one flat color — that's most of what reads as "game asset"
// rather than "clip-art" at this level of procedural art. Swapping this out
// for a real layered sprite sheet later only means rewriting this function;
// the AvatarConfig data model and every scene that consumes it stay the same.

const HEAD_R = 24;
const HEAD_Y = -46;
const TORSO_TOP = -20;
const TORSO_BOTTOM = 26;
const TORSO_HALF_W = 18;
const HIP_Y = TORSO_BOTTOM - 2;
const LEG_LEN = 36;
const LEG_W = 13;
const SHOULDER_Y = TORSO_TOP + 6;
const ARM_LEN = 32;
const OUTLINE = 0x2b2118;

/**
 * @param legSwing current stride angle in degrees (typically -25..25). 0 =
 * idle standing pose. The walk cycle is driven externally (playerController)
 * by calling this every animation tick with an alternating sign — matches
 * the "old 2D games" chunky stepped-frame look rather than smooth easing.
 */
export function drawAvatar(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  config: AvatarConfig,
  legSwing = 0
): void {
  container.removeAll(true);

  const skin = SKIN_TONES[config.skinToneIndex] ?? SKIN_TONES[0];
  const hairColor = HAIR_COLORS[config.hairColorIndex] ?? HAIR_COLORS[0];
  const shirt = SHIRT_COLORS[config.shirtColorIndex] ?? SHIRT_COLORS[0];
  const pants = PANTS_COLORS[config.pantsColorIndex] ?? PANTS_COLORS[0];

  const g = scene.add.graphics();
  const armSwing = -legSwing * 0.7;

  // soft ground-contact shadow, drawn first so everything else sits on top
  g.fillStyle(0x000000, 0.22);
  g.fillEllipse(0, HIP_Y + LEG_LEN + 4, 30, 9);

  // --- back leg (behind torso, swings opposite the front leg) ---
  drawLimb(g, 0, HIP_Y, -legSwing, LEG_W, LEG_LEN, pants, true);

  // --- back arm (near the rear edge of the torso, not the middle of the chest) ---
  drawLimb(g, -TORSO_HALF_W * 0.75, SHOULDER_Y, -armSwing, 11, ARM_LEN, skin, false);

  // --- torso / shirt — gradient, not a flat fill ---
  const shirtW = TORSO_HALF_W * 2;
  const shirtH = TORSO_BOTTOM - TORSO_TOP;
  g.fillGradientStyle(lighten(shirt, 0.28), lighten(shirt, 0.28), darken(shirt, 0.22), darken(shirt, 0.22), 1);
  g.fillRoundedRect(-TORSO_HALF_W, TORSO_TOP, shirtW, shirtH, 8);
  g.lineStyle(2.5, OUTLINE, 1);
  g.strokeRoundedRect(-TORSO_HALF_W, TORSO_TOP, shirtW, shirtH, 8);
  // a thin lighter seam down the front edge for a bit of fabric detail
  g.lineStyle(2, lighten(shirt, 0.4), 0.6);
  g.lineBetween(TORSO_HALF_W - 4, TORSO_TOP + 4, TORSO_HALF_W - 4, TORSO_BOTTOM - 4);

  // --- front leg + front arm (in front of torso) ---
  drawLimb(g, 0, HIP_Y, legSwing, LEG_W, LEG_LEN, pants, true);
  drawLimb(g, TORSO_HALF_W * 0.75, SHOULDER_Y, armSwing, 11, ARM_LEN, skin, false);

  // --- head (side profile) ---
  g.fillStyle(skin, 1);
  g.fillCircle(0, HEAD_Y, HEAD_R);
  // shadow crescent on the back/underside, highlight patch on the top-front —
  // gives the head some roundness instead of a flat disc
  g.fillStyle(darken(skin, 0.16), 0.5);
  g.beginPath();
  g.arc(0, HEAD_Y, HEAD_R - 1, Phaser.Math.DegToRad(110), Phaser.Math.DegToRad(250), false);
  g.lineTo(0, HEAD_Y);
  g.closePath();
  g.fillPath();
  g.fillStyle(lighten(skin, 0.35), 0.55);
  g.fillEllipse(HEAD_R * 0.15, HEAD_Y - HEAD_R * 0.5, HEAD_R * 0.8, HEAD_R * 0.55);
  g.lineStyle(2.5, OUTLINE, 1);
  g.strokeCircle(0, HEAD_Y, HEAD_R);

  // nose bump on the leading (right/front) edge
  g.fillStyle(skin, 1);
  g.beginPath();
  g.moveTo(HEAD_R * 0.82, HEAD_Y - 5);
  g.lineTo(HEAD_R * 1.22, HEAD_Y + 1);
  g.lineTo(HEAD_R * 0.82, HEAD_Y + 6);
  g.closePath();
  g.fillPath();
  g.lineStyle(2.5, OUTLINE, 1);
  g.strokePath();

  // eye + mouth, both toward the front
  g.fillStyle(OUTLINE, 1);
  g.fillCircle(HEAD_R * 0.32, HEAD_Y - 6, 3);
  g.lineStyle(2.5, OUTLINE, 1);
  g.beginPath();
  g.arc(HEAD_R * 0.25, HEAD_Y + 6, 8, Phaser.Math.DegToRad(-10), Phaser.Math.DegToRad(70), false);
  g.strokePath();
  // cheek blush — small warmth touch, cheap but effective
  g.fillStyle(0xff8a80, 0.25);
  g.fillEllipse(HEAD_R * 0.05, HEAD_Y + 8, 7, 4);

  // --- hair (covers back/top, leaves the front face wedge clear) ---
  drawHair(g, config.hairStyleIndex, hairColor);

  container.add(g);
}

// Draws one limb (leg or arm) as a rotated rounded rect hanging from a pivot
// point, using Graphics' transform stack so the rotation is a true swing
// around the joint rather than a translated shape. Shaded lengthwise
// (lighter near the joint, darker toward the extremity) instead of flat.
function drawLimb(
  g: Phaser.GameObjects.Graphics,
  pivotX: number,
  pivotY: number,
  angleDeg: number,
  width: number,
  length: number,
  color: number,
  isLeg: boolean
): void {
  g.save();
  g.translateCanvas(pivotX, pivotY);
  g.rotateCanvas(Phaser.Math.DegToRad(angleDeg));
  g.fillGradientStyle(lighten(color, 0.22), lighten(color, 0.22), darken(color, 0.2), darken(color, 0.2), 1);
  g.fillRoundedRect(-width / 2, 0, width, length, width / 2.5);
  g.lineStyle(2.5, OUTLINE, 1);
  g.strokeRoundedRect(-width / 2, 0, width, length, width / 2.5);
  if (isLeg) {
    g.fillStyle(OUTLINE, 1);
    g.fillRoundedRect(-width / 2 - 2, length - 6, width + 6, 9, 3);
    g.fillStyle(lighten(OUTLINE, 0.3), 0.5);
    g.fillRoundedRect(-width / 2 - 2, length - 6, width + 6, 3, 2);
  }
  g.restore();
}

function drawHair(g: Phaser.GameObjects.Graphics, styleIndex: number, color: number): void {
  const style = ["bald", "short", "curly", "long", "spiky"][styleIndex] ?? "short";
  const light = lighten(color, 0.3);
  g.fillStyle(color, 1);
  g.lineStyle(2.5, OUTLINE, 1);

  // shared "cap" covering the back+top of the head, leaves a front-right
  // wedge clear for the face (roughly -50°..65° stays bare)
  const CAP_START = Phaser.Math.DegToRad(65);
  const CAP_END = Phaser.Math.DegToRad(310);

  switch (style) {
    case "bald":
      g.fillStyle(0xffffff, 0.3);
      g.fillEllipse(-HEAD_R * 0.3, HEAD_Y - HEAD_R * 0.6, 9, 5);
      break;

    case "short":
      g.slice(0, HEAD_Y, HEAD_R + 3, CAP_START, CAP_END, false);
      g.fillPath();
      g.strokePath();
      g.fillStyle(light, 0.4);
      g.slice(0, HEAD_Y, HEAD_R + 1, Phaser.Math.DegToRad(220), Phaser.Math.DegToRad(300), false);
      g.fillPath();
      break;

    case "curly":
      for (const [dx, dy] of [
        [-16, -16], [-4, -22], [10, -18], [-18, -4], [-8, -8], [-16, 6],
      ]) {
        g.fillStyle(color, 1);
        g.fillCircle(dx, HEAD_Y + dy, 7);
        g.strokeCircle(dx, HEAD_Y + dy, 7);
        g.fillStyle(light, 0.45);
        g.fillCircle(dx - 2, HEAD_Y + dy - 2, 3);
      }
      break;

    case "long":
      g.slice(0, HEAD_Y, HEAD_R + 3, CAP_START, CAP_END, false);
      g.fillPath();
      g.strokePath();
      g.fillGradientStyle(light, light, darken(color, 0.25), darken(color, 0.25), 1);
      g.fillRoundedRect(-HEAD_R - 6, HEAD_Y - 8, 12, 46, 5);
      g.lineStyle(2.5, OUTLINE, 1);
      g.strokeRoundedRect(-HEAD_R - 6, HEAD_Y - 8, 12, 46, 5);
      break;

    case "spiky":
      for (const [dx, dy] of [
        [-14, -18], [-2, -22], [8, -20], [-20, -4],
      ]) {
        g.fillStyle(color, 1);
        g.beginPath();
        g.moveTo(dx - 7, HEAD_Y + dy + 8);
        g.lineTo(dx + 7, HEAD_Y + dy + 8);
        g.lineTo(dx, HEAD_Y + dy - 12);
        g.closePath();
        g.fillPath();
        g.strokePath();
        g.fillStyle(light, 0.4);
        g.beginPath();
        g.moveTo(dx - 4, HEAD_Y + dy + 6);
        g.lineTo(dx, HEAD_Y + dy + 6);
        g.lineTo(dx - 1, HEAD_Y + dy - 10);
        g.closePath();
        g.fillPath();
      }
      break;
  }
}
