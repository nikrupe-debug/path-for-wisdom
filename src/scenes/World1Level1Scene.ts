import Phaser from "phaser";
import { buildArcadeBackground } from "../game/background";
import { createEnemy } from "../game/enemyRenderer";
import { createPlayerController, type PlayerController } from "../game/playerController";
import { createTouchControls } from "../game/touchControls";
import { showDrill } from "../game/drillOverlay";
import { gameState } from "../game/gameState";
import { WORLD1_LEVEL1 } from "../data/levels/world1Level1";
import { lighten, darken } from "../game/colorUtils";

const GRASS = 0x6bd66b;
const DIRT = 0x8a5a3a;
const SPIKE_COLOR = 0xc9c9d6;
const GROUND_Y = WORLD1_LEVEL1.groundSegments[0]?.y ?? 510;

export class World1Level1Scene extends Phaser.Scene {
  private player!: PlayerController;
  private enemyDefeated = false;
  private goalFlag!: Phaser.GameObjects.Container;
  private goalGlow!: Phaser.GameObjects.Arc;
  private hurtUntil = 0;
  private completing = false;
  private playerShadow!: Phaser.GameObjects.Ellipse;

  constructor() {
    super("World1Level1");
  }

  create(): void {
    const level = WORLD1_LEVEL1;
    const { worldWidth: W, worldHeight: H } = level;
    this.enemyDefeated = false;
    this.hurtUntil = 0;
    this.completing = false;

    this.physics.world.setBounds(0, 0, W, H);
    buildArcadeBackground(this, W, H);

    // ── ground + gaps + platforms ────────────────────────────────────────
    const solidGroup = this.physics.add.staticGroup();
    for (const gap of level.gaps) {
      this.drawGapVoid(gap.x, gap.w, gap.groundY, H);
    }
    for (const seg of level.groundSegments) {
      this.drawGroundBlock(seg.x, seg.y, seg.w, seg.h, true);
      const body = this.add.rectangle(seg.x + seg.w / 2, seg.y + seg.h / 2, seg.w, seg.h, 0x000000, 0);
      solidGroup.add(body);
    }
    for (const plat of level.platforms) {
      this.drawGroundBlock(plat.x, plat.y, plat.w, plat.h, false);
      const body = this.add.rectangle(plat.x + plat.w / 2, plat.y + plat.h / 2, plat.w, plat.h, 0x000000, 0);
      solidGroup.add(body);
    }

    // ── spikes (hazard, not solid) ───────────────────────────────────────
    const spikeZones: Phaser.GameObjects.Zone[] = [];
    for (const spike of level.spikes) {
      this.drawSpikes(spike.x, spike.groundY);
      const zone = this.add.zone(spike.x, spike.groundY - 14, 40, 28);
      this.physics.add.existing(zone, true);
      spikeZones.push(zone);
    }

    // ── HUD ───────────────────────────────────────────────────────────────
    this.add
      .text(W / 2, 26, 'עולם 1 · שלב 1', {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(500)
      .setShadow(0, 2, "#000000", 4, true, true);

    // ── goal (dimmed until enemy defeated) ──────────────────────────────
    this.goalGlow = this.add.circle(level.goal.x, level.goal.y, 46, 0xffe08a, 0.15).setDepth(5);
    this.goalFlag = this.drawGoalFlag(level.goal.x, level.goal.y);
    const goalZone = this.add.zone(level.goal.x, level.goal.y, 60, 140);
    this.physics.add.existing(goalZone, true);

    // ── enemy ────────────────────────────────────────────────────────────
    const enemyContainer = createEnemy(this, level.enemy.x, level.enemy.y);
    const enemyZone = this.add.zone(level.enemy.x, level.enemy.y, 70, 80);
    this.physics.add.existing(enemyZone, true);

    // ── player + touch controls ─────────────────────────────────────────
    this.playerShadow = this.add.ellipse(level.playerStart.x, GROUND_Y + 2, 44, 12, 0x000000, 0.25).setDepth(1);

    const touch = createTouchControls(this);
    this.player = createPlayerController(
      this,
      level.playerStart.x,
      level.playerStart.y,
      gameState.avatar,
      touch
    );

    this.physics.add.collider(this.player.container, solidGroup);

    this.physics.add.overlap(this.player.container, spikeZones, () => this.hitSpike());
    this.physics.add.overlap(this.player.container, enemyZone, () => {
      if (!this.enemyDefeated) this.startDrill(level.enemy.word, enemyContainer);
    });
    this.physics.add.overlap(this.player.container, goalZone, () => {
      if (this.enemyDefeated) this.completeLevel();
    });
  }

  update(_time: number, delta: number): void {
    this.player.update(delta);

    // shadow tracks the player horizontally and fades/shrinks with jump height
    this.playerShadow.x = this.player.container.x;
    const heightAboveGround = Phaser.Math.Clamp(GROUND_Y - this.player.container.y, 0, 160);
    const t = 1 - heightAboveGround / 160;
    this.playerShadow.setScale(0.5 + 0.5 * t).setAlpha(0.1 + 0.15 * t);

    // fell into a hole — gently respawn at level start
    if (this.player.container.y > WORLD1_LEVEL1.worldHeight + 60) {
      this.respawnPlayer();
    }
  }

  private drawGapVoid(x: number, w: number, groundY: number, worldHeight: number): void {
    const g = this.add.graphics().setDepth(-1);
    g.fillGradientStyle(0x0b0616, 0x0b0616, 0x1b1730, 0x1b1730, 0.95, 0.95, 0.5, 0.5);
    g.fillRect(x, groundY - 6, w, worldHeight - groundY + 6);
    // a thin lighter lip right at the edge so it reads as a step down, not a smear
    g.fillStyle(0x000000, 0.4);
    g.fillRect(x, groundY - 6, w, 6);
  }

  private drawGroundBlock(x: number, y: number, w: number, h: number, withGrass: boolean): void {
    const g = this.add.graphics().setDepth(0);

    // dirt body: vertical gradient (lighter near the surface, darker deep down)
    // instead of one flat brown, plus a scatter of shaded pebbles for texture
    g.fillGradientStyle(lighten(DIRT, 0.15), lighten(DIRT, 0.15), darken(DIRT, 0.35), darken(DIRT, 0.35), 1);
    g.fillRect(x, y, w, h);
    let seed = x * 7 + 13;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < w; i += 22) {
      const px = x + i + 6 + rand() * 8;
      const py = y + 12 + rand() * (h - 20);
      const r = 3 + rand() * 2.5;
      g.fillStyle(darken(DIRT, 0.4), 0.6);
      g.fillCircle(px, py, r);
      g.fillStyle(lighten(DIRT, 0.2), 0.4);
      g.fillCircle(px - r * 0.3, py - r * 0.3, r * 0.4);
    }

    // grass cap: gradient + jagged blades with a lit edge
    const grassH = withGrass ? 12 : 8;
    g.fillGradientStyle(lighten(GRASS, 0.25), lighten(GRASS, 0.25), darken(GRASS, 0.15), darken(GRASS, 0.15), 1);
    g.fillRect(x, y - grassH + 4, w, grassH);
    if (withGrass) {
      for (let i = 0; i < w; i += 16) {
        g.fillStyle(i % 32 === 0 ? lighten(GRASS, 0.35) : darken(GRASS, 0.1), 1);
        g.fillTriangle(x + i, y, x + i + 8, y - 15, x + i + 16, y);
      }
    }
    g.lineStyle(2.5, 0x2b2118, 1);
    g.strokeRect(x, y, w, h);
    // top highlight line right at the grass edge
    g.lineStyle(2, lighten(GRASS, 0.5), 0.5);
    g.lineBetween(x, y - grassH + 4, x + w, y - grassH + 4);
  }

  private drawSpikes(x: number, groundY: number): void {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(x, groundY + 2, 44, 8);
    g.lineStyle(2.5, 0x2b2118, 1);
    for (const dx of [-14, 0, 14]) {
      g.fillGradientStyle(lighten(SPIKE_COLOR, 0.3), darken(SPIKE_COLOR, 0.05), darken(SPIKE_COLOR, 0.05), darken(SPIKE_COLOR, 0.25), 1);
      g.beginPath();
      g.moveTo(x + dx - 9, groundY);
      g.lineTo(x + dx, groundY - 28);
      g.lineTo(x + dx + 9, groundY);
      g.closePath();
      g.fillPath();
      g.strokePath();
      g.lineStyle(2, 0xffffff, 0.5);
      g.lineBetween(x + dx - 2, groundY - 6, x + dx, groundY - 24);
    }
  }

  private drawGoalFlag(x: number, y: number): Phaser.GameObjects.Container {
    const shadow = this.add.ellipse(0, 66, 40, 10, 0x000000, 0.25);
    const g = this.add.graphics();
    g.fillGradientStyle(lighten(0xd4af37, 0.4), lighten(0xd4af37, 0.4), darken(0xd4af37, 0.3), darken(0xd4af37, 0.3), 1);
    g.fillRoundedRect(-4, -70, 8, 140, 3);
    g.lineStyle(2, 0x6b4f14, 1);
    g.strokeRoundedRect(-4, -70, 8, 140, 3);
    g.fillStyle(0xe8c766, 1);
    g.fillCircle(0, -70, 6);
    g.lineStyle(1.5, 0x6b4f14, 1);
    g.strokeCircle(0, -70, 6);

    const flag = this.add.graphics();
    flag.fillGradientStyle(lighten(0x6b6bab, 0.25), lighten(0x6b6bab, 0.25), darken(0x555577, 0.2), darken(0x555577, 0.2), 1);
    flag.fillTriangle(4, -70, 4, -30, 54, -50);
    flag.lineStyle(2, 0x2b2118, 1);
    flag.strokeTriangle(4, -70, 4, -30, 54, -50);
    // a little star on the flag to make it read as a banner, not a random triangle
    flag.fillStyle(0xffe08a, 0.9);
    flag.fillCircle(24, -55, 4);

    const container = this.add.container(x, y, [shadow, g, flag]).setDepth(4);
    return container;
  }

  private hitSpike(): void {
    if (this.time.now < this.hurtUntil) return;
    this.hurtUntil = this.time.now + 800;
    this.cameras.main.shake(150, 0.006);
    // stunMs matters here, not just the velocity — see playerController.bounce:
    // without suppressing input for a beat, held movement keys overwrite the
    // knockback the very next frame and the player never actually leaves the
    // spike's zone, causing a repeating re-trigger loop instead of a bounce-back.
    this.player.bounce(-160, -420, 300);
    this.tweenFlash();
  }

  private tweenFlash(): void {
    const container = this.player.container;
    this.tweens.add({
      targets: container,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 3,
      onComplete: () => container.setAlpha(1),
    });
  }

  private respawnPlayer(): void {
    const { x, y } = WORLD1_LEVEL1.playerStart;
    const body = this.player.container.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    this.player.container.setPosition(x, y);
    this.cameras.main.flash(200, 27, 23, 48);
  }

  private startDrill(word: string, enemyContainer: Phaser.GameObjects.Container): void {
    this.player.freeze();
    showDrill(this, word, () => {
      this.enemyDefeated = true;
      this.player.unfreeze();
      this.tweens.add({
        targets: enemyContainer,
        alpha: 0,
        scale: 0.2,
        angle: 180,
        duration: 400,
        onComplete: () => enemyContainer.destroy(),
      });
      this.tweens.add({
        targets: [this.goalGlow, this.goalFlag],
        scale: 1.15,
        duration: 300,
        yoyo: true,
        repeat: 2,
      });
      this.goalGlow.setFillStyle(0xffe08a, 0.5);
    });
  }

  private completeLevel(): void {
    if (this.completing) return;
    this.completing = true;
    gameState.markLevelComplete("world1-level1");
    this.scene.start("LevelComplete");
  }
}
