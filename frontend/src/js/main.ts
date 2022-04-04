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

const game = new Phaser.Game(config);

const pauseGame = function (this: Phaser.Game) {
  this.scene
    .getScenes(true)
    .filter((scene) => !scene.scene.isPaused())
    .forEach((scene) => scene.scene.pause());
};

game.events.on(Phaser.Core.Events.BLUR, pauseGame, game);
game.events.on(Phaser.Core.Events.HIDDEN, pauseGame, game);

const resumeGame = function (this: Phaser.Game) {
  this.scene
    .getScenes(false)
    .filter((scene) => scene.scene.isPaused())
    .forEach((scene) => scene.scene.resume());
};

game.events.on(Phaser.Core.Events.FOCUS, resumeGame, game);
game.events.on(Phaser.Core.Events.VISIBLE, resumeGame, game);
