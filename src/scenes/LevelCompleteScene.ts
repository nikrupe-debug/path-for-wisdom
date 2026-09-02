import Phaser from "phaser";

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super("LevelComplete");
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x1b1730);

    this.add
      .text(width / 2, height / 2 - 140, "כל הכבוד!", {
        fontFamily: "Arial",
        fontSize: "56px",
        color: "#f4d35e",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 70, "ניצחת את משרת הקוסמים!", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ece6ff",
      })
      .setOrigin(0.5);

    // three stars, popping in one at a time
    const starXs = [width / 2 - 90, width / 2, width / 2 + 90];
    starXs.forEach((x, i) => {
      const star = this.add.text(x, height / 2 + 10, "★", { fontSize: "56px", color: "#f4d35e" }).setOrigin(0.5).setScale(0);
      this.tweens.add({ targets: star, scale: 1, duration: 300, delay: i * 200, ease: "Back.easeOut" });
    });

    this.add
      .text(width / 2, height / 2 + 90, "עולם 1 · שלב 2 — בקרוב", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#9c8fc9",
      })
      .setOrigin(0.5);

    const replayBtn = this.add
      .rectangle(width / 2, height - 80, 240, 56, 0x2a9d8f)
      .setStrokeStyle(3, 0x2b2118)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(width / 2, height - 80, "שחק שוב", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    replayBtn.on("pointerover", () => replayBtn.setFillStyle(0x36c2b0));
    replayBtn.on("pointerout", () => replayBtn.setFillStyle(0x2a9d8f));
    replayBtn.on("pointerdown", () => this.scene.start("World1Level1"));

    // confetti burst
    const colors = [0xf4d35e, 0xef476f, 0x06d6a0, 0x118ab2, 0xffffff];
    for (let i = 0; i < 40; i++) {
      const c = this.add.rectangle(width / 2, height / 2, 10, 10, Phaser.Utils.Array.GetRandom(colors));
      const angle = Math.random() * Math.PI * 2;
      const dist = 150 + Math.random() * 250;
      this.tweens.add({
        targets: c,
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        alpha: 0,
        rotation: Math.random() * 8,
        duration: 900 + Math.random() * 500,
        ease: "Quad.easeOut",
        onComplete: () => c.destroy(),
      });
    }
  }
}
