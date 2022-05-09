import MainScene, { InputStatus } from "./main_scene";

import Foe from "./foe";
import Spear from "./spear";
import backend from "./backend";
import BackgroundScene from "./background_scene";
import * as Types from "../../../backend/src/types";

const DEVICE_KEY = "OETZIT/DEVICE_ID";

export default class FightScene extends MainScene {
  beDevice: Types.Device;
  beGame: Types.Game;
  spawner: Phaser.Time.TimerEvent;

  constructor() {
    super("fight");
  }

  musicSoftReplace(nextMusic: Phaser.Sound.BaseSound) {
    this.music.on("looped", () => {
      this.music.stop();
      this.music.destroy();
      this.music = nextMusic;
      this.music.play();
    });
  }

  planMusicChanges() {
    this.time.delayedCall(0 * 60 * 1000, () =>
      this.musicSoftReplace(this.sound.add("bkg_main_1", { loop: true })),
    );
    this.time.delayedCall(5 * 60 * 1000, () =>
      this.musicSoftReplace(this.sound.add("bkg_main_2", { loop: true })),
    );
    this.time.delayedCall(10 * 60 * 1000, () =>
      this.musicSoftReplace(this.sound.add("bkg_main_3", { loop: true })),
    );
  }

  planWaveAnnouncements() {
    this.time.delayedCall(0 * 60 * 1000, () =>
      this.hud.announceWave("LEVEL 1"),
    );
    this.time.delayedCall(3 * 60 * 1000, () =>
      this.hud.announceWave("LEVEL 2"),
    );
    this.time.delayedCall(6 * 60 * 1000, () =>
      this.hud.announceWave("LEVEL 3"),
    );
    this.time.delayedCall(9 * 60 * 1000, () =>
      this.hud.announceWave("LEVEL 4"),
    );
    this.time.delayedCall(12 * 60 * 1000, () =>
      this.hud.announceWave("FINAL LEVEL"),
    );
  }

  async beforeGameStart() {
    (this.scene.get("background") as BackgroundScene).atmosphere.play();
    this.planMusicChanges();
    this.planWaveAnnouncements();
    await this.initBeDevice();
    await this.initBeGame();
    this.gameTime.paused = false;
    this.spawnFoes();
  }

  async initBeDevice() {
    const deviceId = sessionStorage.getItem(DEVICE_KEY);
    if (deviceId === null) {
      this.beDevice = (await backend.createDevice()).data;
    } else {
      this.beDevice = (await backend.getDevice(deviceId)).data;
    }
    sessionStorage.setItem(DEVICE_KEY, this.beDevice.id);
  }

  async initBeGame() {
    this.beGame = (
      await backend.createGame(this.beDevice.id, {
        began_at: new Date().toISOString(),
        began_at_gmtm: this.getGameTime(),
      })
    ).data;
  }

  nthFibonacci(n: number) {
    return Math.round(Math.pow((1 + Math.sqrt(5)) / 2, n) / Math.sqrt(5));
  }

  submitTranscription = (inputStatus: InputStatus) => {
    const similarityThreshold = 0.9;
    // NOTE: this ain't async to avoid any UX delay
    const { similarity, match } = this.findMatchingFoe(inputStatus.final);

    let score = 0;
    if (match === null) {
      score = 0;
    } else if (similarity < similarityThreshold) {
      score = -1;
    } else {
      const lengthScore = this.nthFibonacci(
        1 + match.beWord.ocr_transcript.length,
      );
      const accuracyBonus = similarity;
      const speedBonus =
        2 -
        (inputStatus.ended_at_gmtm - match.beClue.began_at_gmtm) /
          (match.duration * 1000);
      score = Math.round(lengthScore * accuracyBonus * speedBonus);
    }

    backend.createShot(this.beGame.id, {
      clue_id: match?.beClue?.id || null,
      similarity: similarity,
      score: score,
      ...inputStatus,
    });

    if (match === null) {
      // NOOP
      this.sound.play("sfx_md_beep");
      this.hud.showSubmitFeedback("white", inputStatus.final);
    } else if (similarity < similarityThreshold) {
      // TODO: visual near misses based on score
      this.sound.play("sfx_lo_beep");
      this.updateScore(score);
      match.handleFailure();
      this.hud.showSubmitFeedback("red", inputStatus.final);
      new Spear(this, this.player, undefined);
    } else {
      this.acceptedWords += 1;
      this.sound.play("sfx_hi_beep");
      backend.updateClue(match.beClue.id, {
        ended_at: new Date().toISOString(),
        ended_at_gmtm: this.getGameTime(),
      });
      this.updateScore(score);
      this.popFoe(match);
      match.handleSuccess();
      this.hud.showSubmitFeedback("green", inputStatus.final);
      new Spear(this, this.player, match.critter);
    }
  };

  clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
  }

  randomExponential(rate = 1) {
    // http://en.wikipedia.org/wiki/Exponential_distribution#Generating_exponential_variates
    return -Math.log(Math.random()) / rate;
  }

  randomPareto(scale = 1, shape = 1) {
    // https://en.wikipedia.org/wiki/Pareto_distribution#Random_sample_generation
    return scale / Math.pow(Math.random(), 1 / shape);
  }

  sawtoothRamp(t: number, peaksCount = 5, dipsHeight = 0.2, midwayAt = 0.3) {
    // https://www.desmos.com/calculator/7zcb6p8qeu
    // NOTE: this always maps [0;1] ↦ [0;1]
    const ramp = t * (peaksCount * dipsHeight + 1);
    const dips =
      (-Math.floor(t * peaksCount) * (peaksCount * dipsHeight)) /
      (peaksCount - 1);
    const bend = Math.log(0.5) / Math.log(midwayAt);
    return Math.pow(ramp + dips, bend);
  }

  getDifficulty(t: number, plateausAt = 15 * 60000) {
    // NOTE: c'mon... 15 minutes?
    // NOTE: this maps [0;∞] ↦ [0;1]
    if (t >= plateausAt) return 1;
    return this.sawtoothRamp(t / plateausAt);
  }

  async spawnFoes() {
    const difficulty = this.getDifficulty(this.getGameTime());

    const AVG_WPM = 40; // avg is 41.4, current world record is ~212wpm
    const minDelay = 60 / (5.0 * AVG_WPM); // 0.3s -> world record!
    const maxDelay = 60 / (0.2 * AVG_WPM); // 7.5s -> utter boredom!

    // const expDelay = 60 / (1.0 * AVG_WPM); // 1.5s -> average typer
    const expDelay = maxDelay + (minDelay - maxDelay) * difficulty;
    const rate = 1 / expDelay;

    const delay =
      this.clamp(this.randomExponential(rate), minDelay, maxDelay) * 1000;

    const AVG_CPM = 200; // corresponds to AVG_WPM and AVG_CPW = 5
    // const minLength = 1;
    const minLength = Math.round(1 + (3 - 1) * difficulty);
    // const maxLength = 12;
    const maxLength = Math.round(3 + (18 - 3) * difficulty);

    // const expLength = AVG_CPM / AVG_WPM; // i.e. 5 char is avg
    const expLength = minLength + (maxLength - minLength) * difficulty;
    const scale = minLength;
    const shape = expLength / (expLength - scale);

    const length = this.clamp(
      Math.round(this.randomPareto(scale, shape)),
      minLength,
      maxLength,
    );

    // const minCount = 0; // NOTE: no minCount because the player deserves rest
    const maxCount = 4;
    // const minChars = 0; // NOTE: no minChars because the player deserves rest
    const maxChars = 40;

    const currentCount = this.foes.length;
    const currentChars = this.foes
      .map((foe) => foe.beWord.ocr_transcript.length)
      .reduce((a, b) => a + b, 0);

    const duration =
      (3 + (1 - 3) * difficulty) *
      (expLength + (length - expLength) * difficulty);

    if (currentCount < maxCount && currentChars < maxChars) {
      await this.spawnFoe(10, 1);
    }

    this.spawner = this.time.delayedCall(100, this.spawnFoes.bind(this));
  }

  async spawnFoe(length: number, timeout: number) {
    // TODO: this is a terrible pattern
    await new Foe(this, timeout).initialize(length);
  }

  async afterGameEnd() {
    this.beGame = (
      await backend.updateGame(this.beGame.id, {
        ended_at: new Date().toISOString(),
        ended_at_gmtm: this.getGameTime(),
        score: this.score,
      })
    ).data;
    this.spawner.remove();

    this.scene.start("game_over", {
      music: this.music,
      words: this.acceptedWords,
      score: this.beGame.score,
      time: this.beGame.ended_at_gmtm,
    });
  }
}
