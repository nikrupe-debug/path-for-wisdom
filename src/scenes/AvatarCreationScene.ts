import Phaser from "phaser";
import { drawAvatar } from "../game/avatarRenderer";
import { gameState } from "../game/gameState";
import { defaultAvatarConfig, type AvatarConfig } from "../types/avatar";
import {
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  SHIRT_COLORS,
  PANTS_COLORS,
  cyclicIndex,
} from "../game/avatarOptions";

const HAIR_STYLE_LABELS_HE: Record<string, string> = {
  bald: "קרחת",
  short: "קצר",
  curly: "מתולתל",
  long: "ארוך",
  spiky: "דוקרני",
};

type RowKind = "swatch" | "label";

interface RowDef {
  key: keyof AvatarConfig;
  title: string;
  kind: RowKind;
  colors?: number[];
  labels?: string[];
}

export class AvatarCreationScene extends Phaser.Scene {
  private config: AvatarConfig = defaultAvatarConfig();
  private avatarContainer!: Phaser.GameObjects.Container;
  private nameInput!: HTMLInputElement;
  private startButton!: Phaser.GameObjects.Rectangle;
  private errorText!: Phaser.GameObjects.Text;

  constructor() {
    super("AvatarCreation");
  }

  create(): void {
    // start from a fresh default each time we enter this scene, but keep
    // any name already typed previously in the same session
    const existing = gameState.avatar;
    this.config = { ...defaultAvatarConfig(), ...existing };

    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x1b1730);

    this.add
      .text(width / 2, 44, "בנה את הגיבור שלך", {
        fontFamily: "Arial",
        fontSize: "38px",
        color: "#f4d35e",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // --- avatar preview (left side) ---
    this.avatarContainer = this.add.container(240, 340).setScale(2.4);
    drawAvatar(this, this.avatarContainer, this.config);

    // pedestal
    this.add.ellipse(240, 470, 160, 26, 0x2a2340).setDepth(-1);

    // --- name field label + DOM input ---
    this.add
      .text(240, 130, "שם הגיבור:", {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#ece6ff",
      })
      .setOrigin(0.5);

    this.nameInput = document.getElementById("name-input") as HTMLInputElement;
    this.nameInput.value = this.config.name;
    this.nameInput.placeholder = "Name";
    this.nameInput.style.display = "block";
    this.positionNameInput();
    this.nameInput.oninput = () => {
      this.config.name = this.nameInput.value;
      this.errorText.setVisible(false);
    };

    const resizeHandler = () => this.positionNameInput();
    window.addEventListener("resize", resizeHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("resize", resizeHandler);
      this.nameInput.style.display = "none";
    });

    // --- customization rows (right side) ---
    const rows: RowDef[] = [
      { key: "skinToneIndex", title: "צבע עור", kind: "swatch", colors: SKIN_TONES },
      {
        key: "hairStyleIndex",
        title: "תסרוקת",
        kind: "label",
        labels: HAIR_STYLES.map((s) => HAIR_STYLE_LABELS_HE[s]),
      },
      { key: "hairColorIndex", title: "צבע שיער", kind: "swatch", colors: HAIR_COLORS },
      { key: "shirtColorIndex", title: "צבע חולצה", kind: "swatch", colors: SHIRT_COLORS },
      { key: "pantsColorIndex", title: "צבע מכנסיים", kind: "swatch", colors: PANTS_COLORS },
    ];

    const startY = 170;
    const rowH = 68;
    rows.forEach((row, i) => this.createRow(row, 560, startY + i * rowH));

    // --- start button ---
    this.errorText = this.add
      .text(width / 2, height - 92, "בחר שם לפני שיוצאים לדרך!", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ff6b6b",
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.startButton = this.add
      .rectangle(width / 2, height - 48, 260, 56, 0x2a9d8f)
      .setStrokeStyle(3, 0x2b2118)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, height - 48, "צאו לדרך!", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.startButton.on("pointerover", () => this.startButton.setFillStyle(0x36c2b0));
    this.startButton.on("pointerout", () => this.startButton.setFillStyle(0x2a9d8f));
    this.startButton.on("pointerdown", () => this.handleStart());
  }

  private createRow(row: RowDef, x: number, y: number): void {
    this.add
      .text(x, y - 22, row.title, {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#9c8fc9",
      })
      .setOrigin(0.5);

    const leftArrow = this.add
      .text(x - 90, y, "◀", { fontFamily: "Arial", fontSize: "28px", color: "#f4d35e" })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const rightArrow = this.add
      .text(x + 90, y, "▶", { fontFamily: "Arial", fontSize: "28px", color: "#f4d35e" })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    let display: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text;
    if (row.kind === "swatch") {
      const colors = row.colors!;
      const rect = this.add
        .rectangle(x, y, 64, 36, colors[this.config[row.key] as number])
        .setStrokeStyle(2, 0x2b2118);
      display = rect;
    } else {
      const labels = row.labels!;
      const text = this.add
        .text(x, y, labels[this.config[row.key] as number], {
          fontFamily: "Arial",
          fontSize: "18px",
          color: "#ece6ff",
        })
        .setOrigin(0.5);
      display = text;
    }

    const length = row.kind === "swatch" ? row.colors!.length : row.labels!.length;

    const update = (delta: number) => {
      const current = this.config[row.key] as number;
      const next = cyclicIndex(current, delta, length);
      (this.config as unknown as Record<string, number>)[row.key] = next;

      if (row.kind === "swatch") {
        (display as Phaser.GameObjects.Rectangle).setFillStyle(row.colors![next]);
      } else {
        (display as Phaser.GameObjects.Text).setText(row.labels![next]);
      }
      drawAvatar(this, this.avatarContainer, this.config);
    };

    leftArrow.on("pointerdown", () => update(-1));
    rightArrow.on("pointerdown", () => update(1));
  }

  private positionNameInput(): void {
    const canvas = this.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / this.scale.width;
    const scaleY = rect.height / this.scale.height;

    const gameX = 240;
    const gameY = 165;
    const boxWidth = 220;

    this.nameInput.style.width = `${boxWidth * scaleX}px`;
    this.nameInput.style.left = `${rect.left + gameX * scaleX - (boxWidth * scaleX) / 2}px`;
    this.nameInput.style.top = `${rect.top + gameY * scaleY - 20 * scaleY}px`;
    this.nameInput.style.fontSize = `${22 * Math.min(scaleX, scaleY)}px`;
  }

  private handleStart(): void {
    const trimmed = this.config.name.trim();
    if (!trimmed) {
      this.errorText.setVisible(true);
      this.nameInput.focus();
      return;
    }
    this.config.name = trimmed;
    gameState.setAvatar(this.config);
    this.nameInput.style.display = "none";
    this.scene.start("World1Placeholder");
  }
}
