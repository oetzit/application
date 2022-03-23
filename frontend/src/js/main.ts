import * as Phaser from "phaser";

import FightScene from "./fight_scene";

export const GRAVITY_Y = 200;

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth, // 1200,
  height: window.innerHeight, // 800,
  pixelArt: true,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  scaleMode: Phaser.Scale.FIT,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: GRAVITY_Y },
      // debug: true,
    },
  },
  scene: FightScene,
};

new Phaser.Game(config);
