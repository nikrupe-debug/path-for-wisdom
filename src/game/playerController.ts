import Phaser from "phaser";
import { drawAvatar } from "./avatarRenderer";
import type { AvatarConfig } from "../types/avatar";
import type { TouchControls } from "./touchControls";

const SPEED = 230;
const JUMP_VELOCITY = -560;
const BODY_W = 56;
const BODY_H = 128;

export interface PlayerController {
  container: Phaser.GameObjects.Container;
  update(): void;
  freeze(): void; // stops accepting input (used while a drill overlay is open)
  unfreeze(): void;
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
  drawAvatar(scene, container, avatar);

  scene.physics.add.existing(container);
  const body = container.body as Phaser.Physics.Arcade.Body;
  // NOTE: Arcade Physics bodies on a Container do NOT auto-scale with the
  // container's own .setScale() — setSize/setOffset are literal pixel values
  // in the same space as if scale were 1. Since this container is scaled by
  // baseScale for display, the body must be pre-multiplied by baseScale too,
  // or the collision box ends up far smaller than the visible character
  // (it'll look like the character sinks into the ground).
  body.setSize(BODY_W * baseScale, BODY_H * baseScale);
  body.setOffset((-BODY_W / 2) * baseScale, -68 * baseScale);
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

  function update(): void {
    if (frozen) return;

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
  };
}
