export interface AvatarConfig {
  name: string;
  skinToneIndex: number;
  hairStyleIndex: number;
  hairColorIndex: number;
  shirtColorIndex: number;
  pantsColorIndex: number;
}

export function defaultAvatarConfig(): AvatarConfig {
  return {
    name: "",
    skinToneIndex: 0,
    hairStyleIndex: 1,
    hairColorIndex: 0,
    shirtColorIndex: 0,
    pantsColorIndex: 0,
  };
}
