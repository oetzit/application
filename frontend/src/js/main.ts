import * as Phaser from "phaser";

import FightScene from "./fight_scene";

const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  pixelArt: true,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  scaleMode: Phaser.Scale.FIT,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
      debug: true,
    },
  },
  scene: FightScene,
};

new Phaser.Game(config);
