import * as Phaser from "phaser";

import fightScene from "./fight_scene";

let config = {
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
      debug: false,
    },
  },
  scene: fightScene,
};

const game = new Phaser.Game(config);
window.game = game;
