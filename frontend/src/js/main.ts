import * as Phaser from "phaser";

import BackgroundScene from "./background_scene";
import WelcomeScene from "./welcome_scene";
import FightScene from "./fight_scene";
import GameOverScene from "./game_over_scene";

export const GRAVITY_Y = 200;

const config = {
  type: Phaser.AUTO,
  // TODO: bound height, with responsive aspect ratio
  pixelArt: true,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  scaleMode: Phaser.Scale.RESIZE,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: GRAVITY_Y },
      // debug: true,
    },
  },
  scene: [BackgroundScene, WelcomeScene, FightScene, GameOverScene],
};

new Phaser.Game(config);
