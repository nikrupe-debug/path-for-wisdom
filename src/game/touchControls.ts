import Phaser from "phaser";

// On-screen controls for touch devices (this is a phone/tablet PWA first).
// Keyboard still works too — playerController merges both input sources.
// Fixed to the camera (scrollFactor 0) so they stay put if a level scrolls.
export interface TouchControls {
  left: boolean;
  right: boolean;
  jump: boolean;
  destroy(): void;
}

function makeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  radius: number,
  color: number,
  label: string
): { zone: Phaser.GameObjects.Arc; setActive: (v: boolean) => void } {
  const circle = scene.add
    .circle(x, y, radius, color, 0.35)
    .setStrokeStyle(3, 0xffffff, 0.6)
    .setScrollFactor(0)
    .setDepth(1000)
    .setInteractive({ useHandCursor: true });

  scene.add
    .text(x, y, label, { fontFamily: "Arial", fontSize: `${radius}px`, color: "#ffffff" })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1001)
    .setAlpha(0.85);

  const setActive = (v: boolean) => circle.setFillStyle(color, v ? 0.65 : 0.35);
  return { zone: circle, setActive };
}

export function createTouchControls(scene: Phaser.Scene): TouchControls {
  const { width, height } = scene.scale;
  const state: TouchControls = {
    left: false,
    right: false,
    jump: false,
    destroy() {
      leftBtn.zone.destroy();
      rightBtn.zone.destroy();
      jumpBtn.zone.destroy();
    },
  };

  // Kept low and small so they sit in a clear UI strip below the play area
  // instead of overlapping the character/ground (see level layout — ground
  // surface is deliberately raised to leave room for this strip).
  const leftBtn = makeButton(scene, 54, height - 40, 34, 0xf4d35e, "◀");
  const rightBtn = makeButton(scene, 140, height - 40, 34, 0xf4d35e, "▶");
  const jumpBtn = makeButton(scene, width - 60, height - 40, 40, 0x2a9d8f, "⤒");

  const bind = (btn: typeof leftBtn, onChange: (v: boolean) => void) => {
    btn.zone.on("pointerdown", () => { onChange(true); btn.setActive(true); });
    const release = () => { onChange(false); btn.setActive(false); };
    btn.zone.on("pointerup", release);
    btn.zone.on("pointerout", release);
  };

  bind(leftBtn, (v) => (state.left = v));
  bind(rightBtn, (v) => (state.right = v));
  bind(jumpBtn, (v) => (state.jump = v));

  return state;
}
