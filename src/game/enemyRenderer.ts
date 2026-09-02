import Phaser from "phaser";

// A "shadow minion" — one of the evil sorcerers' servants. Floats and bobs
// (no legs needed, keeps this simple procedurally) with a glowing-eyes look
// that reads as "cute villain," not scary, matching the game's tone.
export function createEnemy(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Container {
  const g = scene.add.graphics();

  // wisp/smoke trail tail
  g.fillStyle(0x3a2a5c, 0.5);
  g.fillEllipse(0, 30, 26, 14);
  g.fillEllipse(0, 40, 16, 10);

  // body
  g.fillStyle(0x5b3a9e, 1);
  g.fillEllipse(0, 0, 56, 62);
  g.lineStyle(3, 0x2b2118, 1);
  g.strokeEllipse(0, 0, 56, 62);

  // little bat-ish ear/horns
  g.fillStyle(0x5b3a9e, 1);
  g.beginPath();
  g.moveTo(-22, -22);
  g.lineTo(-32, -46);
  g.lineTo(-12, -30);
  g.closePath();
  g.fillPath();
  g.strokePath();
  g.beginPath();
  g.moveTo(22, -22);
  g.lineTo(32, -46);
  g.lineTo(12, -30);
  g.closePath();
  g.fillPath();
  g.strokePath();

  // glowing eyes
  g.fillStyle(0xd6f36b, 1);
  g.fillCircle(-14, -4, 9);
  g.fillCircle(14, -4, 9);
  g.fillStyle(0x2b2118, 1);
  g.fillCircle(-14, -2, 4);
  g.fillCircle(14, -2, 4);

  // mischievous mouth
  g.lineStyle(3, 0x2b2118, 1);
  g.beginPath();
  g.arc(0, 16, 12, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false);
  g.strokePath();

  const container = scene.add.container(x, y, [g]);

  scene.tweens.add({
    targets: container,
    y: y - 12,
    duration: 900,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
  scene.tweens.add({
    targets: g,
    angle: 4,
    duration: 1400,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  return container;
}
