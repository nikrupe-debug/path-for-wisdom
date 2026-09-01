import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { StoryIntroScene } from "./scenes/StoryIntroScene";
import { AvatarCreationScene } from "./scenes/AvatarCreationScene";
import { World1PlaceholderScene } from "./scenes/World1PlaceholderScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 960,
  height: 600,
  backgroundColor: "#1b1730",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: { gravity: { x: 0, y: 900 }, debug: false },
  },
  scene: [BootScene, StoryIntroScene, AvatarCreationScene, World1PlaceholderScene],
};

new Phaser.Game(config);
