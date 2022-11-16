import * as Phaser from "phaser";

import LoadingScene from "./loading_scene";
import BackgroundScene from "./background_scene";
import WelcomeScene from "./welcome_scene";
import FightScene from "./fight_scene";
import GameOverScene from "./game_over_scene";
import PauseScene from "./pause_scene";
import TutorialScene from "./tutorial_scene";
import LeaderboardScene from "./leaderboard_scene";
import RegisterScene from "./register_scene";

import * as Types from "../../../backend/src/types";
import backend from "./backend";
import Records from "./records";
import Storage from "./storage";

const DEVICE_ID_KEY = "OETZIT/DEVICE_ID";

export const GRAVITY_Y = 200;

const CONFIG = {
  type: Phaser.AUTO,
  pixelArt: true,
  width: 640,
  height: 400,
  autoRound: true,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  scaleMode: Phaser.Scale.FIT,
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
    GameOverScene,
    LeaderboardScene,
    RegisterScene,
    PauseScene, // NOTE: keep this as last for overlaying
  ],
};

export default class Game extends Phaser.Game {
  beDevice!: Types.Device;
  storage = new Storage();
  records = new Records(this.storage);

  constructor() {
    super(CONFIG);
    this.bindFocusEvents();
  }

  async initBeDevice() {
    const deviceId = this.storage.getItem(DEVICE_ID_KEY);
    if (deviceId === null) {
      this.beDevice = (await backend.createDevice()).data;
    } else {
      this.beDevice = (await backend.getDevice(deviceId)).data;
    }
    this.storage.setItem(DEVICE_ID_KEY, this.beDevice.id);
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
