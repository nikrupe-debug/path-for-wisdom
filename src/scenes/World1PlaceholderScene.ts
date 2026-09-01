import Phaser from "phaser";
import { drawAvatar } from "../game/avatarRenderer";
import { gameState } from "../game/gameState";

// Stands in for "World 1 — Alphabet Valley, Level 1" until real platformer
// content (tilemap, enemies, drills) is built. Confirms the avatar carries
// through correctly and the scene flow works end to end.
export class World1PlaceholderScene extends Phaser.Scene {
  constructor() {
    super("World1Placeholder");
  }

  create(): void {
    const { width, height } = this.scale;
    const avatar = gameState.avatar;

    this.cameras.main.setBackgroundColor(0x4a7a3c);

    // simple ground strip so it reads as "world", not a menu
    this.add.rectangle(width / 2, height - 60, width, 120, 0x6b4a2f);
    this.add.rectangle(width / 2, height - 118, width, 8, 0x7fb85c);

    const container = this.add.container(width / 2, height - 170).setScale(2);
    drawAvatar(this, container, avatar);

    this.add
      .text(width / 2, 60, `ברוך הבא, ${avatar.name}!`, {
        fontFamily: "Arial",
        fontSize: "34px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 110, "עולם 1: עמק האותיות — בקרוב", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#e8ffe0",
      })
      .setOrigin(0.5);

    const backButton = this.add
      .text(80, 40, "◀ ערוך גיבור", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#f4d35e",
      })
      .setInteractive({ useHandCursor: true });
    backButton.on("pointerdown", () => this.scene.start("AvatarCreation"));
  }
}
