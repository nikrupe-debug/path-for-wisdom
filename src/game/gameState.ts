import { defaultAvatarConfig, type AvatarConfig } from "../types/avatar";

// Simple persisted singleton — no React here, so a plain module-level store
// is enough. Progress fields are placeholders for World 1+ to build on.

const STORAGE_KEY = "path-for-wisdom-save";

interface SaveData {
  avatar: AvatarConfig;
  unlockedWorlds: number;
  completedLevels: string[];
}

function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SaveData;
      return {
        avatar: { ...defaultAvatarConfig(), ...parsed.avatar },
        unlockedWorlds: parsed.unlockedWorlds ?? 1,
        completedLevels: parsed.completedLevels ?? [],
      };
    }
  } catch {
    // corrupted save — fall through to a fresh one
  }
  return { avatar: defaultAvatarConfig(), unlockedWorlds: 1, completedLevels: [] };
}

class GameState {
  private data: SaveData = loadSave();

  get avatar(): AvatarConfig {
    return this.data.avatar;
  }

  setAvatar(avatar: AvatarConfig): void {
    this.data.avatar = avatar;
    this.persist();
  }

  markLevelComplete(levelId: string): void {
    if (!this.data.completedLevels.includes(levelId)) {
      this.data.completedLevels.push(levelId);
      this.persist();
    }
  }

  isLevelComplete(levelId: string): boolean {
    return this.data.completedLevels.includes(levelId);
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }
}

export const gameState = new GameState();
