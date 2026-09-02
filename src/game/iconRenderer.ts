import Phaser from "phaser";

// Flat, bold, colorful icons — same "no external art needed" philosophy as
// the avatar renderer. Used both for drill answer choices and for anything
// else that needs to visually represent a Tier-0 word. Each icon is drawn
// into a square of side `size` centered at (0,0) in local space.

export type IconId = "sun" | "star" | "ball" | "cat" | "tree" | "fish" | "moon" | "apple";

const OUTLINE = 0x2b2118;

export function drawIcon(g: Phaser.GameObjects.Graphics, icon: IconId, size: number): void {
  const r = size / 2;
  g.lineStyle(Math.max(2, size / 24), OUTLINE, 1);

  switch (icon) {
    case "sun": {
      g.fillStyle(0xffd23f, 1);
      g.fillCircle(0, 0, r * 0.55);
      g.strokeCircle(0, 0, r * 0.55);
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI / 4) * i;
        const x1 = Math.cos(a) * r * 0.68, y1 = Math.sin(a) * r * 0.68;
        const x2 = Math.cos(a) * r * 0.95, y2 = Math.sin(a) * r * 0.95;
        g.lineBetween(x1, y1, x2, y2);
      }
      break;
    }
    case "star": {
      g.fillStyle(0xffe066, 1);
      const pts: number[] = [];
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI / 5) * i - Math.PI / 2;
        const rad = i % 2 === 0 ? r * 0.95 : r * 0.42;
        pts.push(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      g.beginPath();
      g.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
      g.closePath();
      g.fillPath();
      g.strokePath();
      break;
    }
    case "ball": {
      g.fillStyle(0xef476f, 1);
      g.fillCircle(0, 0, r * 0.85);
      g.strokeCircle(0, 0, r * 0.85);
      g.lineStyle(Math.max(2, size / 30), 0xffffff, 1);
      g.beginPath();
      g.arc(0, 0, r * 0.85, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
      g.strokePath();
      g.beginPath();
      g.arc(0, 0, r * 0.85, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false);
      g.strokePath();
      break;
    }
    case "cat": {
      g.fillStyle(0xf4a261, 1);
      g.fillCircle(0, r * 0.05, r * 0.75);
      g.strokeCircle(0, r * 0.05, r * 0.75);
      // ears
      g.beginPath();
      g.moveTo(-r * 0.55, -r * 0.45);
      g.lineTo(-r * 0.15, -r * 0.95);
      g.lineTo(-r * 0.05, -r * 0.35);
      g.closePath();
      g.fillPath(); g.strokePath();
      g.beginPath();
      g.moveTo(r * 0.55, -r * 0.45);
      g.lineTo(r * 0.15, -r * 0.95);
      g.lineTo(r * 0.05, -r * 0.35);
      g.closePath();
      g.fillPath(); g.strokePath();
      // face
      g.fillStyle(OUTLINE, 1);
      g.fillCircle(-r * 0.28, r * 0.0, r * 0.08);
      g.fillCircle(r * 0.28, r * 0.0, r * 0.08);
      g.lineStyle(Math.max(2, size / 28), OUTLINE, 1);
      g.lineBetween(-r * 0.15, r * 0.3, r * 0.15, r * 0.3);
      g.beginPath();
      g.arc(-r * 0.1, r * 0.32, r * 0.15, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(120), false);
      g.strokePath();
      g.beginPath();
      g.arc(r * 0.1, r * 0.32, r * 0.15, Phaser.Math.DegToRad(60), Phaser.Math.DegToRad(160), false);
      g.strokePath();
      break;
    }
    case "tree": {
      g.fillStyle(0x8d5524, 1);
      g.fillRoundedRect(-r * 0.14, r * 0.15, r * 0.28, r * 0.75, 3);
      g.strokeRoundedRect(-r * 0.14, r * 0.15, r * 0.28, r * 0.75, 3);
      g.fillStyle(0x2a9d8f, 1);
      g.fillCircle(0, -r * 0.35, r * 0.65);
      g.fillCircle(-r * 0.4, -r * 0.05, r * 0.45);
      g.fillCircle(r * 0.4, -r * 0.05, r * 0.45);
      g.strokeCircle(0, -r * 0.35, r * 0.65);
      break;
    }
    case "fish": {
      g.fillStyle(0x4cc9f0, 1);
      g.fillEllipse(-r * 0.05, 0, r * 1.3, r * 0.85);
      g.strokeEllipse(-r * 0.05, 0, r * 1.3, r * 0.85);
      g.beginPath();
      g.moveTo(r * 0.55, 0);
      g.lineTo(r * 0.95, -r * 0.4);
      g.lineTo(r * 0.95, r * 0.4);
      g.closePath();
      g.fillPath(); g.strokePath();
      g.fillStyle(OUTLINE, 1);
      g.fillCircle(-r * 0.45, -r * 0.1, r * 0.09);
      break;
    }
    case "moon": {
      g.fillStyle(0xe0e1dd, 1);
      g.fillCircle(0, 0, r * 0.8);
      g.fillStyle(0x1b1730, 1);
      g.fillCircle(r * 0.3, -r * 0.15, r * 0.65);
      g.lineStyle(Math.max(2, size / 24), OUTLINE, 1);
      g.strokeCircle(0, 0, r * 0.8);
      break;
    }
    case "apple": {
      g.fillStyle(0xe63946, 1);
      g.fillCircle(-r * 0.25, r * 0.1, r * 0.55);
      g.fillCircle(r * 0.25, r * 0.1, r * 0.55);
      g.strokeCircle(-r * 0.25, r * 0.1, r * 0.55);
      g.strokeCircle(r * 0.25, r * 0.1, r * 0.55);
      g.fillStyle(0x2a9d8f, 1);
      g.fillEllipse(r * 0.05, -r * 0.55, r * 0.35, r * 0.18);
      g.lineStyle(Math.max(2, size / 24), 0x774936, 1);
      g.lineBetween(0, -r * 0.4, 0, -r * 0.65);
      break;
    }
  }
}

export function makeIconContainer(scene: Phaser.Scene, icon: IconId, size: number): Phaser.GameObjects.Container {
  const g = scene.add.graphics();
  drawIcon(g, icon, size);
  return scene.add.container(0, 0, [g]);
}
