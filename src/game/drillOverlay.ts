import Phaser from "phaser";
import { pickDrillOptions } from "../data/tier0Words";
import { drawIcon } from "./iconRenderer";
import { speakWord } from "./speech";
import { lighten, darken } from "./colorUtils";

export interface DrillHandle {
  destroy(): void;
}

const PANEL_COLORS = [0xef476f, 0xffd166, 0x06d6a0, 0x118ab2];
const BTN_SIZE = 130;

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
  const panelX = width / 2, panelY = height / 2;

  // drop shadow behind the panel, then a gradient-filled panel instead of a
  // flat rect — reads as a real dialog box, not a placeholder rectangle
  const panelShadow = add(
    scene.add.rectangle(panelX + 6, panelY + 8, panelW, panelH, 0x000000, 0.35)
  );
  const panelG = scene.add.graphics().setScrollFactor(0).setDepth(depthBase + 1);
  panelG.fillGradientStyle(lighten(0x1b1730, 0.15), lighten(0x1b1730, 0.15), darken(0x1b1730, 0.3), darken(0x1b1730, 0.3), 1);
  panelG.fillRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 18);
  panelG.lineStyle(5, 0xf4d35e, 1);
  panelG.strokeRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 18);
  panelG.lineStyle(2, lighten(0xf4d35e, 0.4), 0.5);
  panelG.strokeRoundedRect(panelX - panelW / 2 + 5, panelY - panelH / 2 + 5, panelW - 10, panelH - 10, 14);
  add(panelShadow.setScrollFactor(0).setDepth(depthBase));
  add(panelG);

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
      .setShadow(0, 2, "#000000", 4, true, true)
  );

  // speaker / replay button — gradient disc + shadow, like the touch controls
  const speakerX = width / 2, speakerY = height / 2 - panelH / 2 + 90;
  const speakerG = scene.add.graphics().setScrollFactor(0).setDepth(depthBase + 2);
  const drawSpeaker = (pressed: boolean) => {
    speakerG.clear();
    speakerG.fillStyle(0x000000, 0.25);
    speakerG.fillCircle(speakerX + 2, speakerY + 3, 34);
    speakerG.fillStyle(darken(0x2a9d8f, pressed ? 0.15 : 0), 1);
    speakerG.fillCircle(speakerX, speakerY, 34);
    speakerG.fillStyle(lighten(0x2a9d8f, 0.3), 1);
    speakerG.fillCircle(speakerX, speakerY - (pressed ? 0 : 4), 28);
    speakerG.lineStyle(3, 0xffffff, 0.6);
    speakerG.strokeCircle(speakerX, speakerY, 34);
  };
  drawSpeaker(false);
  add(speakerG);
  add(
    scene.add
      .text(speakerX, speakerY, "🔊", { fontSize: "30px" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depthBase + 3)
  );
  const speakerHit = add(
    scene.add.zone(speakerX, speakerY, 68, 68).setScrollFactor(0).setDepth(depthBase + 4).setInteractive({ useHandCursor: true })
  ) as Phaser.GameObjects.Zone;
  speakerHit.on("pointerdown", () => {
    speakWord(word);
    drawSpeaker(true);
    scene.time.delayedCall(120, () => drawSpeaker(false));
  });

  const optionY = height / 2 + 40;
  const spacing = 170;
  const startX = width / 2 - spacing;

  let resolved = false;

  options.forEach((opt, i) => {
    const x = startX + i * spacing;
    const color = PANEL_COLORS[i % PANEL_COLORS.length];

    // shadow + gradient-filled rounded square instead of a flat rect.
    // Drawn in LOCAL coordinates (button center = local 0,0) with position
    // set via setPosition, not baked into the draw calls — a Graphics object
    // scales/rotates around its own (x,y), so absolute-coordinate drawing
    // would make the later "correct answer" scale-tween balloon away from
    // the button instead of growing in place.
    const btnShadow = add(scene.add.rectangle(x + 4, optionY + 5, BTN_SIZE, BTN_SIZE, 0x000000, 0.3));
    btnShadow.setScrollFactor(0).setDepth(depthBase + 1);

    const btnG = scene.add.graphics().setPosition(x, optionY).setScrollFactor(0).setDepth(depthBase + 2);
    const drawBtn = () => {
      btnG.clear();
      btnG.fillGradientStyle(lighten(color, 0.25), lighten(color, 0.25), darken(color, 0.2), darken(color, 0.2), 1);
      btnG.fillRoundedRect(-BTN_SIZE / 2, -BTN_SIZE / 2, BTN_SIZE, BTN_SIZE, 16);
      btnG.lineStyle(4, 0xffffff, 0.85);
      btnG.strokeRoundedRect(-BTN_SIZE / 2, -BTN_SIZE / 2, BTN_SIZE, BTN_SIZE, 16);
    };
    drawBtn();
    add(btnG);

    const iconG = scene.add.graphics();
    drawIcon(iconG, opt.icon, 90);
    const iconContainer = add(
      scene.add.container(x, optionY, [iconG]).setScrollFactor(0).setDepth(depthBase + 3)
    ) as Phaser.GameObjects.Container;

    const hit = add(
      scene.add
        .zone(x, optionY, BTN_SIZE, BTN_SIZE)
        .setScrollFactor(0)
        .setDepth(depthBase + 4)
        .setInteractive({ useHandCursor: true })
    ) as Phaser.GameObjects.Zone;

    hit.on("pointerdown", () => {
      if (resolved) return;
      if (opt.word === word) {
        resolved = true;
        scene.tweens.add({ targets: [btnG, iconContainer], scale: 1.25, duration: 150, ease: "Back.easeOut" });
        btnG.lineStyle(6, 0x06d6a0, 1);
        btnG.strokeRoundedRect(-BTN_SIZE / 2, -BTN_SIZE / 2, BTN_SIZE, BTN_SIZE, 16);
        burstConfetti(scene, x, optionY, depthBase + 5);
        scene.time.delayedCall(420, () => {
          destroy();
          onCorrect();
        });
      } else {
        scene.cameras.main.shake(120, 0.004);
        scene.tweens.add({
          targets: [btnG, iconContainer],
          x: "-=8",
          duration: 40,
          yoyo: true,
          repeat: 3,
        });
      }
    });
  });

  // speak the word once automatically when the drill opens
  scene.time.delayedCall(150, () => speakWord(word));

  function destroy(): void {
    nodes.forEach((n) => n.destroy());
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
