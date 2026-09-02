import Phaser from "phaser";
import { pickDrillOptions } from "../data/tier0Words";
import { drawIcon } from "./iconRenderer";
import { speakWord } from "./speech";

export interface DrillHandle {
  destroy(): void;
}

const PANEL_COLORS = [0xef476f, 0xffd166, 0x06d6a0, 0x118ab2];

export function showDrill(
  scene: Phaser.Scene,
  word: string,
  onCorrect: () => void
): DrillHandle {
  const { width, height } = scene.scale;
  const depthBase = 2000;
  const options = pickDrillOptions(word, 3);
  // debug-only hook for automated testing — harmless for real players, lets
  // a test script know which option is correct without reading the canvas
  if (typeof window !== "undefined") {
    (window as unknown as { __lastDrill?: unknown }).__lastDrill = {
      word,
      options: options.map((o) => o.word),
    };
  }

  const nodes: Phaser.GameObjects.GameObject[] = [];
  const add = <T extends Phaser.GameObjects.GameObject>(obj: T): T => {
    nodes.push(obj);
    return obj;
  };

  add(
    scene.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.55)
      .setScrollFactor(0)
      .setDepth(depthBase)
      .setInteractive() // swallow clicks behind the overlay
  );

  const panelW = 620, panelH = 300;
  const panel = add(
    scene.add
      .rectangle(width / 2, height / 2, panelW, panelH, 0x1b1730, 0.97)
      .setStrokeStyle(5, 0xf4d35e)
      .setScrollFactor(0)
      .setDepth(depthBase + 1)
  );

  add(
    scene.add
      .text(width / 2, height / 2 - panelH / 2 + 34, "איזו מילה שמעת?", {
        fontFamily: "Arial",
        fontSize: "26px",
        color: "#f4d35e",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depthBase + 2)
  );

  // speaker / replay button
  const speakerBtn = add(
    scene.add
      .circle(width / 2, height / 2 - panelH / 2 + 90, 34, 0x2a9d8f)
      .setStrokeStyle(3, 0xffffff, 0.7)
      .setScrollFactor(0)
      .setDepth(depthBase + 2)
      .setInteractive({ useHandCursor: true })
  ) as Phaser.GameObjects.Arc;
  add(
    scene.add
      .text(width / 2, height / 2 - panelH / 2 + 90, "🔊", { fontSize: "30px" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depthBase + 3)
  );
  speakerBtn.on("pointerdown", () => {
    speakWord(word);
    scene.tweens.add({ targets: speakerBtn, scale: 1.2, duration: 100, yoyo: true });
  });

  const optionY = height / 2 + 40;
  const spacing = 170;
  const startX = width / 2 - spacing;

  let resolved = false;

  options.forEach((opt, i) => {
    const x = startX + i * spacing;
    const color = PANEL_COLORS[i % PANEL_COLORS.length];

    const btn = add(
      scene.add
        .rectangle(x, optionY, 130, 130, color, 1)
        .setStrokeStyle(4, 0xffffff, 0.8)
        .setScrollFactor(0)
        .setDepth(depthBase + 2)
        .setInteractive({ useHandCursor: true })
    ) as Phaser.GameObjects.Rectangle;

    const iconG = scene.add.graphics();
    drawIcon(iconG, opt.icon, 90);
    const iconContainer = add(
      scene.add.container(x, optionY, [iconG]).setScrollFactor(0).setDepth(depthBase + 3)
    ) as Phaser.GameObjects.Container;

    btn.on("pointerdown", () => {
      if (resolved) return;
      if (opt.word === word) {
        resolved = true;
        scene.tweens.add({ targets: [btn, iconContainer], scale: 1.25, duration: 150, ease: "Back.easeOut" });
        btn.setStrokeStyle(6, 0x06d6a0, 1);
        burstConfetti(scene, x, optionY, depthBase + 4);
        scene.time.delayedCall(420, () => {
          destroy();
          onCorrect();
        });
      } else {
        scene.cameras.main.shake(120, 0.004);
        scene.tweens.add({
          targets: [btn, iconContainer],
          x: x - 8,
          duration: 40,
          yoyo: true,
          repeat: 3,
          onComplete: () => { btn.x = x; iconContainer.x = x; },
        });
      }
    });
  });

  // speak the word once automatically when the drill opens
  scene.time.delayedCall(150, () => speakWord(word));

  function destroy(): void {
    nodes.forEach((n) => n.destroy());
    panel.destroy();
  }

  return { destroy };
}

function burstConfetti(scene: Phaser.Scene, x: number, y: number, depth: number): void {
  const colors = [0xf4d35e, 0xef476f, 0x06d6a0, 0x118ab2, 0xffffff];
  for (let i = 0; i < 16; i++) {
    const c = scene.add
      .rectangle(x, y, 8, 8, Phaser.Utils.Array.GetRandom(colors))
      .setScrollFactor(0)
      .setDepth(depth);
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 80;
    scene.tweens.add({
      targets: c,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      alpha: 0,
      rotation: Math.random() * 6,
      duration: 500 + Math.random() * 300,
      ease: "Quad.easeOut",
      onComplete: () => c.destroy(),
    });
  }
}
