import Phaser from "phaser";

// Vibrant "magic evening" arcade backdrop: gradient sky, glow, drifting
// clouds, parallax mountain silhouette. Purely decorative, depth-sorted
// behind everything else (call this first in the scene's create()).
export function buildArcadeBackground(scene: Phaser.Scene, width: number, height: number): void {
  const sky = scene.add.graphics().setDepth(-100);
  sky.fillGradientStyle(0x2d1b4e, 0x2d1b4e, 0xff6f91, 0xffb14e, 1);
  sky.fillRect(0, 0, width, height);

  // glow behind a sun/moon disc
  const glow = scene.add.circle(width - 130, 110, 90, 0xffe08a, 0.25).setDepth(-95);
  scene.tweens.add({ targets: glow, alpha: 0.4, duration: 2200, yoyo: true, repeat: -1 });
  scene.add.circle(width - 130, 110, 50, 0xfff3c4, 1).setDepth(-94);
  scene.add.circle(width - 130, 110, 50, 0xffd23f, 0.5).setDepth(-94);

  // distant mountains (parallax layer, static for a single-screen level)
  const mountains = scene.add.graphics().setDepth(-90);
  mountains.fillStyle(0x3a2a5c, 0.9);
  drawRidge(mountains, width, height * 0.62, height * 0.22, 5, 41);
  const mountains2 = scene.add.graphics().setDepth(-88);
  mountains2.fillStyle(0x4a3570, 0.85);
  drawRidge(mountains2, width, height * 0.72, height * 0.16, 6, 97);

  // drifting clouds
  for (let i = 0; i < 4; i++) {
    const cx = 100 + i * 240 + Math.random() * 60;
    const cy = 60 + Math.random() * 90;
    const cloud = drawCloud(scene, cx, cy);
    cloud.setDepth(-80);
    scene.tweens.add({
      targets: cloud,
      x: cloud.x + 40,
      duration: 6000 + i * 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}

function drawRidge(
  g: Phaser.GameObjects.Graphics,
  width: number,
  baseY: number,
  amplitude: number,
  peaks: number,
  seed: number
): void {
  const pts: number[] = [0, baseY + amplitude];
  const step = width / peaks;
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i <= peaks; i++) {
    pts.push(i * step, baseY - amplitude * (0.4 + rand() * 0.6));
  }
  pts.push(width, baseY + amplitude);
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.lineTo(width, baseY + amplitude + 40);
  g.lineTo(0, baseY + amplitude + 40);
  g.closePath();
  g.fillPath();
}

function drawCloud(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Container {
  const g = scene.add.graphics();
  g.fillStyle(0xffffff, 0.8);
  g.fillEllipse(0, 0, 70, 30);
  g.fillEllipse(-30, 6, 46, 22);
  g.fillEllipse(30, 6, 46, 22);
  return scene.add.container(x, y, [g]);
}
