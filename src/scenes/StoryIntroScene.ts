import Phaser from "phaser";

const STORY_TEXT =
  "ביום בהיר אחד, קוסמים מרושעים הופיעו מוקים אפלים וחטפו את ההורים שלך אל מצודה נסתרת!\n\n" +
  "רק דבר אחד יכול לשבור את הכישוף שלהם: מילות כוח עתיקות, הכתובות בשפה רחוקה — אנגלית.\n\n" +
  "כדי להציל את ההורים שלך, עליך לצעוד ב'שביל החוכמה', להביס את משרתי הקוסמים בדרך,\n" +
  "וללמוד מהם מילה חדשה בכל פעם שתביס אותם.\n\n" +
  "האם אתה מוכן להתחיל את המסע?";

export class StoryIntroScene extends Phaser.Scene {
  constructor() {
    super("StoryIntro");
  }

  create(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor(0x1b1730);

    this.add
      .text(width / 2, 70, "שביל החוכמה", {
        fontFamily: "Arial",
        fontSize: "48px",
        color: "#f4d35e",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 120, "The Path for Wisdom", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#9c8fc9",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 10, STORY_TEXT, {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#ece6ff",
        align: "center",
        wordWrap: { width: width - 160 },
        lineSpacing: 6,
      })
      .setOrigin(0.5);

    const button = this.add
      .rectangle(width / 2, height - 70, 240, 60, 0xf4d35e)
      .setStrokeStyle(3, 0x2b2118)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, height - 70, "המשך", {
        fontFamily: "Arial",
        fontSize: "26px",
        color: "#2b2118",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    button.on("pointerover", () => button.setFillStyle(0xf7e08a));
    button.on("pointerout", () => button.setFillStyle(0xf4d35e));
    button.on("pointerdown", () => this.scene.start("AvatarCreation"));
  }
}
