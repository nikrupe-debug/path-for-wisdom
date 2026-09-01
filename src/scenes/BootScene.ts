import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create(): void {
    // No external assets yet — avatar + backgrounds are drawn procedurally.
    // This scene exists as the seam where a real preload bar goes once
    // sprite sheets / audio files are added.
    this.scene.start("StoryIntro");
  }
}
