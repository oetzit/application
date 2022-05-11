import * as Phaser from "phaser";

import LoadingScene from "./loading_scene";
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
    LoadingScene,
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

  bindFocusEvents() {
    const getScene = () => this.scene.getScene("pause") as PauseScene;
    const pause = () => getScene().focusPause(false);
    const resume = () => getScene().focusResume(false);
    this.events.on(Phaser.Core.Events.BLUR, pause);
    this.events.on(Phaser.Core.Events.HIDDEN, pause);
    this.events.on(Phaser.Core.Events.FOCUS, resume);
    this.events.on(Phaser.Core.Events.VISIBLE, resume);
  }
}
