import * as Phaser from "phaser";

import BackgroundScene from "./background_scene";
import WelcomeScene from "./welcome_scene";
import FightScene from "./fight_scene";
import GameOverScene from "./game_over_scene";

export const GRAVITY_Y = 200;

const CONFIG = {
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

export default class Game extends Phaser.Game {
  constructor() {
    super(CONFIG);
    this.bindFocusEvents();
  }

  pause() {
    this.scene
      .getScenes(true)
      .filter((scene) => !scene.scene.isPaused())
      .forEach((scene) => scene.scene.pause());
  }

  resume() {
    this.scene
      .getScenes(false)
      .filter((scene) => scene.scene.isPaused())
      .forEach((scene) => scene.scene.resume());
  }

  bindFocusEvents() {
    this.events.on(Phaser.Core.Events.BLUR, this.pause.bind(this));
    this.events.on(Phaser.Core.Events.HIDDEN, this.pause.bind(this));
    this.events.on(Phaser.Core.Events.FOCUS, this.resume.bind(this));
    this.events.on(Phaser.Core.Events.VISIBLE, this.resume.bind(this));
  }
}
