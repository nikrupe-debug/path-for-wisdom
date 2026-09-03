import Phaser from "phaser";
import { lighten, darken } from "./colorUtils";

// On-screen controls for touch devices (this is a phone/tablet PWA first).
// Keyboard still works too — playerController merges both input sources.
// Fixed to the camera (scrollFactor 0) so they stay put if a level scrolls.
export interface TouchControls {
  left: boolean;
  right: boolean;
  jump: boolean;
  destroy(): void;
}

function drawButtonFace(g: Phaser.GameObjects.Graphics, radius: number, color: number, pressed: boolean): void {
  g.clear();
  // soft drop shadow
  g.fillStyle(0x000000, 0.25);
  g.fillCircle(3, 4, radius);

  const top = pressed ? color : lighten(color, 0.35);
  const bottom = pressed ? darken(color, 0.25) : darken(color, 0.1);

  // base + a lighter cap for a beveled, "real button" feel instead of a
  // single flat fill
  g.fillStyle(bottom, 0.95);
  g.fillCircle(0, 0, radius);
  g.fillStyle(top, 0.95);
  g.fillCircle(0, pressed ? 0 : -radius * 0.12, radius * 0.86);

  g.lineStyle(3, 0xffffff, 0.55);
  g.strokeCircle(0, 0, radius);
}

function makeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  radius: number,
  color: number,
  label: string
): { hit: Phaser.GameObjects.Zone; setActive: (v: boolean) => void } {
  const face = scene.add.graphics().setPosition(x, y).setScrollFactor(0).setDepth(1000);
  drawButtonFace(face, radius, color, false);

  scene.add
    .text(x, y, label, { fontFamily: "Arial", fontSize: `${radius}px`, color: "#ffffff" })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1001)
    .setShadow(0, 2, "#000000", 3, true, true);

  const hit = scene.add
    .zone(x, y, radius * 2.2, radius * 2.2)
    .setScrollFactor(0)
    .setDepth(1002)
    .setInteractive({ useHandCursor: true });

  const setActive = (v: boolean) => drawButtonFace(face, radius, color, v);
  return { hit, setActive };
}

export function createTouchControls(scene: Phaser.Scene): TouchControls {
  const { width, height } = scene.scale;
  const state: TouchControls = {
    left: false,
    right: false,
    jump: false,
    destroy() {
      leftBtn.hit.destroy();
      rightBtn.hit.destroy();
      jumpBtn.hit.destroy();
    },
  };

  // Sized to fill the dedicated UI strip below the play area (ground surface
  // sits well above this, see level data) without overlapping gameplay.
  const btnY = height - 46;
  const leftBtn = makeButton(scene, 66, btnY, 46, 0xf4d35e, "◀");
  const rightBtn = makeButton(scene, 184, btnY, 46, 0xf4d35e, "▶");
  const jumpBtn = makeButton(scene, width - 76, btnY, 56, 0x2a9d8f, "⤒");

  const bind = (btn: typeof leftBtn, onChange: (v: boolean) => void) => {
    btn.hit.on("pointerdown", () => { onChange(true); btn.setActive(true); });
    const release = () => { onChange(false); btn.setActive(false); };
    btn.hit.on("pointerup", release);
    btn.hit.on("pointerout", release);
  };

  bind(leftBtn, (v) => (state.left = v));
  bind(rightBtn, (v) => (state.right = v));
  bind(jumpBtn, (v) => (state.jump = v));

  return state;
}
