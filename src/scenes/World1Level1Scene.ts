import Phaser from "phaser";
import { buildArcadeBackground } from "../game/background";
import { createEnemy } from "../game/enemyRenderer";
import { createPlayerController, type PlayerController } from "../game/playerController";
import { createTouchControls } from "../game/touchControls";
import { showDrill } from "../game/drillOverlay";
import { gameState } from "../game/gameState";
import { WORLD1_LEVEL1 } from "../data/levels/world1Level1";

const GRASS = 0x6bd66b;
const DIRT = 0x8a5a3a;
const DIRT_DARK = 0x6e4529;
const SPIKE_COLOR = 0xd0d0d8;

export class World1Level1Scene extends Phaser.Scene {
  private player!: PlayerController;
  private enemyDefeated = false;
  private goalFlag!: Phaser.GameObjects.Container;
  private goalGlow!: Phaser.GameObjects.Arc;
  private hurtUntil = 0;
  private completing = false;

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
    g.fillStyle(DIRT, 1);
    g.fillRect(x, y, w, h);
    g.fillStyle(DIRT_DARK, 1);
    for (let i = 0; i < w; i += 26) {
      g.fillRect(x + i + 4, y + 14, 14, 4);
    }
    if (withGrass) {
      g.fillStyle(GRASS, 1);
      g.fillRect(x, y - 8, w, 12);
      g.fillStyle(0x4fae4f, 1);
      for (let i = 0; i < w; i += 18) {
        g.fillTriangle(x + i, y, x + i + 9, y - 14, x + i + 18, y);
      }
    } else {
      g.fillStyle(GRASS, 1);
      g.fillRect(x, y - 6, w, 8);
    }
    g.lineStyle(2, 0x2b2118, 1);
    g.strokeRect(x, y, w, h);
  }

  private drawSpikes(x: number, groundY: number): void {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(SPIKE_COLOR, 1);
    g.lineStyle(2, 0x2b2118, 1);
    for (const dx of [-14, 0, 14]) {
      g.beginPath();
      g.moveTo(x + dx - 9, groundY);
      g.lineTo(x + dx, groundY - 28);
      g.lineTo(x + dx + 9, groundY);
      g.closePath();
      g.fillPath();
      g.strokePath();
    }
  }

  private drawGoalFlag(x: number, y: number): Phaser.GameObjects.Container {
    const g = this.add.graphics();
    g.fillStyle(0xd4af37, 1);
    g.fillRect(-4, -70, 8, 140);
    g.fillStyle(0x6b6b8a, 0.5);
    g.fillCircle(0, -70, 6);
    const flag = this.add.graphics();
    flag.fillStyle(0x555577, 1);
    flag.fillTriangle(4, -70, 4, -30, 54, -50);
    const container = this.add.container(x, y, [g, flag]).setDepth(4);
    return container;
  }

  private hitSpike(): void {
    if (this.time.now < this.hurtUntil) return;
    this.hurtUntil = this.time.now + 800;
    this.cameras.main.shake(150, 0.006);
    const body = this.player.container.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(-150, -350);
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
