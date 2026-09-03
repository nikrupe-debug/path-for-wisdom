// Level layout as data, not code — matches the project's "content is data"
// principle. Adding Level 2 later means adding another file like this one,
// not touching World1Level1Scene's logic.
export interface RectData {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GapData {
  x: number;
  w: number;
  groundY: number; // top of the ground surface on either side, for the void's top edge
}

export interface Level1Data {
  worldWidth: number;
  worldHeight: number;
  groundSegments: RectData[]; // full-height ground blocks (top surface at y)
  gaps: GapData[]; // the holes between ground segments, purely visual (no physics needed)
  platforms: RectData[]; // floating step platforms
  spikes: { x: number; groundY: number }[]; // base sits on top of ground at groundY
  playerStart: { x: number; y: number };
  enemy: { x: number; y: number; word: string };
  goal: { x: number; y: number };
}

// Ground surface deliberately sits at y=510 (not the canvas bottom, 600) —
// this leaves a clean 90px strip at the very bottom of the screen for the
// on-screen touch controls so they never overlap the player/ground visuals.
export const WORLD1_LEVEL1: Level1Data = {
  worldWidth: 960,
  worldHeight: 600,
  groundSegments: [
    { x: 0, y: 510, w: 380, h: 90 },
    { x: 480, y: 510, w: 480, h: 90 },
  ],
  gaps: [{ x: 380, w: 100, groundY: 510 }],
  // No floating platform in this level for now. Originally removed after it
  // seemed to physically wedge the player when placed over the gap — but
  // that investigation surfaced a real bug in playerController (the physics
  // hitbox was ~1.7x too large in every dimension from a double-applied
  // scale factor, see playerController.ts). With that fixed, a platform may
  // well work fine now; it just hasn't been re-tried yet. Worth revisiting
  // before assuming platforms/steps are fundamentally incompatible with
  // this level's jump height and player scale.
  platforms: [],
  spikes: [{ x: 260, groundY: 510 }],
  playerStart: { x: 60, y: 420 },
  enemy: { x: 800, y: 470, word: "cat" },
  goal: { x: 920, y: 450 },
};
