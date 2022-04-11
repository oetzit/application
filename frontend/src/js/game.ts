import * as Phaser from "phaser";

import BackgroundScene from "./background_scene";
import WelcomeScene from "./welcome_scene";
import FightScene from "./fight_scene";
import GameOverScene from "./game_over_scene";
import PauseScene from "./pause_scene";
import TutorialScene from "./tutorial_scene";

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
  scene: [
    BackgroundScene,
    WelcomeScene,
    TutorialScene,
    FightScene,
    PauseScene,
    GameOverScene,
  ],
};

export default class Game extends Phaser.Game {
  constructor() {
    super(CONFIG);
    this.bindFocusEvents();
  }

  pauseFight() {
    if (this.scene.isActive("fight")) this.scene.pause("fight");
  }

  resumeFight() {
    if (this.scene.isPaused("fight")) this.scene.resume("fight");
  }

  bindFocusEvents() {
    this.events.on(Phaser.Core.Events.BLUR, this.pauseFight.bind(this));
    this.events.on(Phaser.Core.Events.HIDDEN, this.pauseFight.bind(this));
    this.events.on(Phaser.Core.Events.FOCUS, this.resumeFight.bind(this));
    this.events.on(Phaser.Core.Events.VISIBLE, this.resumeFight.bind(this));
  }
}
