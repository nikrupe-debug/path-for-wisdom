import Phaser from "phaser";
import { drawAvatar } from "./avatarRenderer";
import type { AvatarConfig } from "../types/avatar";
import type { TouchControls } from "./touchControls";

const SPEED = 230;
const JUMP_VELOCITY = -560;
const BODY_W = 56;
const BODY_H = 128;

// Walk-cycle animation: a chunky, stepped 2-pose leg swap (not a smoothly
// eased sine wave) — matches the "old 2D games" look the character was
// asked to have, where sprites swap between a handful of discrete frames
// rather than animating continuously.
const WALK_FRAME_MS = 130;
const WALK_ANGLE = 24;

export interface PlayerController {
  container: Phaser.GameObjects.Container;
  update(delta: number): void;
  freeze(): void; // stops accepting input (used while a drill overlay is open)
  unfreeze(): void;
  // Sets velocity directly and suppresses input-driven movement for
  // `stunMs` — without this, held-direction input overwrites velocityX
  // again on the very next frame, cancelling any knockback instantly and
  // letting hazards trap the player in a repeating bounce-in-place loop.
  bounce(vx: number, vy: number, stunMs: number): void;
}

export function createPlayerController(
  scene: Phaser.Scene,
  x: number,
  y: number,
  avatar: AvatarConfig,
  touch: TouchControls,
  baseScale = 1.7
): PlayerController {
  const container = scene.add.container(x, y).setScale(baseScale);
  drawAvatar(scene, container, avatar, 0);

  scene.physics.add.existing(container);
  const body = container.body as Phaser.Physics.Arcade.Body;
  // NOTE: Arcade Physics DOES auto-scale a Container body's size/offset by
  // the container's current .setScale() (confirmed empirically — logging
  // body.width during play showed 162px for a setSize(56,...) call with
  // baseScale 1.7: 56*1.7≈95, and Phaser scaled that again to 95*1.7≈162).
  // An earlier fix here mistakenly concluded the opposite and pre-multiplied
  // by baseScale to fix a visual "sinking into the ground" symptom — that
  // pre-multiplication double-applies the scale, producing a hitbox nearly
  // twice the visible character's size (mostly extending further right/up
  // than the sprite), which triggered spikes/enemies/goals the player hadn't
  // visually reached yet — the actual cause of a since-reported "enemies are
  // unreachable" bug. Pass the literal, unscaled values; Phaser scales them.
  body.setSize(BODY_W, BODY_H);
  body.setOffset(-BODY_W / 2, -68);
  body.setCollideWorldBounds(true);

  const cursors = scene.input.keyboard?.createCursorKeys();
  const keys = scene.input.keyboard?.addKeys("W,A,S,D") as
    | Record<string, Phaser.Input.Keyboard.Key>
    | undefined;

  let facing = 1;
  let wasGrounded = true;
  let wasJumpHeld = false;
  let bobTime = 0;
  let frozen = false;

  let walkTimer = 0;
  let walkSign = 1;
  let legSwing = 0;
  let stunnedUntil = 0;

  function squash(sx: number, sy: number, duration = 90): void {
    scene.tweens.add({
      targets: container,
      scaleX: baseScale * facing * sx,
      scaleY: baseScale * sy,
      duration,
      yoyo: true,
      ease: "Quad.easeOut",
    });
  }

  function update(delta: number): void {
    if (frozen) return;
    // during a knockback stun, let the imparted velocity + gravity play out
    // undisturbed instead of reading input (which would overwrite velocityX
    // this same frame and cancel any horizontal knockback instantly)
    if (scene.time.now < stunnedUntil) return;

    const leftDown = !!cursors?.left.isDown || !!keys?.A.isDown || touch.left;
    const rightDown = !!cursors?.right.isDown || !!keys?.D.isDown || touch.right;
    const jumpDown = !!cursors?.up.isDown || !!keys?.W.isDown || touch.jump;

    const moveDir = (rightDown ? 1 : 0) - (leftDown ? 1 : 0);
    body.setVelocityX(moveDir * SPEED);
    if (moveDir !== 0) facing = moveDir;

    const grounded = body.blocked.down || body.touching.down;

    if (jumpDown && !wasJumpHeld && grounded) {
      body.setVelocityY(JUMP_VELOCITY);
      squash(1.25, 0.75, 110);
    }
    wasJumpHeld = jumpDown;

    if (grounded && !wasGrounded) squash(1.2, 0.82, 90);
    wasGrounded = grounded;

    // running bob: small vertical wobble layered on top of the physics-driven
    // y each frame (read current y as the baseline so it never fights gravity)
    if (grounded && moveDir !== 0) {
      bobTime += 0.28;
      container.y += Math.sin(bobTime) * 0.6;
    } else {
      bobTime = 0;
    }

    // walk cycle: swap legs on a fixed timer while actually walking on the
    // ground; snap straight back to the idle pose the instant movement stops
    // (no lingering mid-stride frame) and hold the current pose while airborne
    // rather than animating mid-air.
    if (grounded && moveDir !== 0) {
      walkTimer += delta;
      if (walkTimer >= WALK_FRAME_MS) {
        walkTimer -= WALK_FRAME_MS;
        walkSign *= -1;
        legSwing = walkSign * WALK_ANGLE;
        drawAvatar(scene, container, avatar, legSwing);
      }
    } else if (grounded && legSwing !== 0) {
      walkTimer = 0;
      legSwing = 0;
      drawAvatar(scene, container, avatar, 0);
    }

    // flip to face the movement direction without disturbing whatever the
    // squash/stretch tween currently has scaleX animating through — flipping
    // the sign of the current magnitude is safe whether or not a tween is
    // mid-flight (a no-op when facing hasn't changed).
    container.scaleX = Math.abs(container.scaleX) * facing;
  }

  return {
    container,
    update,
    freeze() {
      frozen = true;
      body.setVelocityX(0);
    },
    unfreeze() {
      frozen = false;
    },
    bounce(vx, vy, stunMs) {
      body.setVelocity(vx, vy);
      stunnedUntil = scene.time.now + stunMs;
    },
  };
}
