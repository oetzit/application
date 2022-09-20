import MainScene, { InputStatus } from "./main_scene";

import Foe from "./foe";
import Game from "./game";
import Spear from "./spear";
import backend from "./backend";
import BackgroundScene from "./background_scene";
import * as Types from "../../../backend/src/types";
import {
  clamp,
  nthFibonacci,
  randomExponential,
  randomPareto,
  sawtoothRamp,
} from "./utils";
import Logger from "./logger";
import { SpriteCluePayload } from "./clue_payloads";

export default class FightScene extends MainScene {
  log = new Logger("FightScene");

  game!: Game;
  tapoutEnabled = true;
  typewriterEnabled = true;

  beGame!: Types.Game;
  spawner!: Phaser.Time.TimerEvent;

  constructor() {
    super("fight");
  }

  async beforeGameStart() {
    this.planBackgroundTransitions();
    this.planMusicChanges();
    this.planWaveAnnouncements();

    await this.initBeGame();

    this.spawnFoes();
  }

  async afterGameEnd() {
    this.beGame = (
      await backend.updateGame(this.beGame.id, {
        ended_at: new Date().toISOString(),
        ended_at_gmtm: this.getGameTime(),
        score: this.score,
      })
    ).data;

    this.game.records.updateLast({
      level: this.getDifficulty(this.beGame.ended_at_gmtm ?? 0),
      words: this.acceptedWords,
      score: this.beGame.score ?? 0,
      timer: this.beGame.ended_at_gmtm ?? 0,
    });
  }

  //=[ Ambient transitions ]====================================================

  planBackgroundTransitions() {
    (this.scene.get("background") as BackgroundScene).atmosphere.play();
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
    // TODO: parameterize
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

  //=[ BE initialization ]======================================================

  async initBeGame() {
    this.beGame = (
      await backend.createGame(this.game.beDevice.id, {
        began_at: new Date().toISOString(),
        began_at_gmtm: this.getGameTime(),
      })
    ).data;
  }

  //=[ Game loop ]==============================================================

  submitTranscription = (inputStatus: InputStatus) => {
    const similarityThreshold = 0.9;
    // NOTE: this ain't async to avoid any UX delay
    const { match, casefullLevenshtein, caselessLevenshtein } =
      this.findMatchingFoe(inputStatus.final);

    let score = 0;
    if (match === null) {
      score = 0;
    } else if (caselessLevenshtein.similarity < similarityThreshold) {
      score = -1;
    } else {
      const lengthScore = nthFibonacci(1 + match.beWord.ocr_transcript.length);
      const accuracyMalus =
        (casefullLevenshtein.similarity + caselessLevenshtein.similarity) / 2;
      const speedBonus =
        2 -
        (inputStatus.ended_at_gmtm - (match.beClue.began_at_gmtm || 0)) /
          (match.duration * 1000);
      score = Math.round(lengthScore * accuracyMalus * speedBonus);
    }

    backend.createShot(this.beGame.id, {
      clue_id: match?.beClue?.id || null,
      similarity: casefullLevenshtein.similarity,
      score: score,
      ...inputStatus,
    });

    if (match === null) {
      // NOOP
      this.sound.play("sfx_md_beep");
      this.hud.showSubmitFeedback("white", inputStatus.final);
    } else if (caselessLevenshtein.similarity < similarityThreshold) {
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
      this.focusedFoe = undefined;
      match.handleSuccess();
      this.hud.showSubmitFeedback("green", inputStatus.final);
      new Spear(this, this.player, match.critter);
      this.spotlight();
    }
  };

  getDifficulty(t: number, plateausAt = 15 * 60000) {
    // NOTE: c'mon... 15 minutes?
    // NOTE: this maps [0;∞] ↦ [0;1]
    if (t >= plateausAt) return 1;
    return sawtoothRamp(t / plateausAt);
  }

  async spawnFoes() {
    const difficulty = this.getDifficulty(this.getGameTime());

    const AVG_WPM = 40; // avg is 41.4, current world record is ~212wpm
    const minDelay = 60 / (5.0 * AVG_WPM); // 0.3s -> world record!
    const maxDelay = 60 / (0.2 * AVG_WPM); // 7.5s -> utter boredom!

    // const expDelay = 60 / (1.0 * AVG_WPM); // 1.5s -> average typer
    const expDelay = maxDelay + (minDelay - maxDelay) * difficulty;
    const rate = 1 / expDelay;

    const delay = clamp(randomExponential(rate), minDelay, maxDelay) * 1000;

    // const AVG_CPM = 200; // corresponds to AVG_WPM and AVG_CPW = 5
    // const minLength = 1;
    const minLength = Math.round(1 + (3 - 1) * difficulty);
    // const maxLength = 12;
    const maxLength = Math.round(3 + (18 - 3) * difficulty);

    // const expLength = AVG_CPM / AVG_WPM; // i.e. 5 char is avg
    const expLength = minLength + (maxLength - minLength) * difficulty;
    const scale = minLength;
    const shape = expLength / (expLength - scale);

    const length = clamp(
      Math.round(randomPareto(scale, shape)),
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
      await this.spawnFoe(length, duration);
    }

    if (!this.scene.isActive()) return;

    this.spawner = this.time.delayedCall(delay, this.spawnFoes.bind(this));
  }

  async spawnFoe(length: number, timeout: number) {
    const beWord = (
      await backend.createWordChoice({
        ocr_confidence_min: 0.4,
        ocr_confidence_max: 0.8,
        ocr_transcript_length_min: length,
        ocr_transcript_length_max: length,
      })
    ).data;

    const beClue = (
      await backend.createClue(this.beGame.id, {
        word_id: beWord.id,
        began_at: new Date().toISOString(),
        began_at_gmtm: this.getGameTime(),
      })
    ).data;

    const response = await backend.getWordImage(beWord.page_id, beWord.word_id);
    const texture = {
      key: `${beWord.id}-${Date.now()}`,
      data: `data:image/png;base64,${Buffer.from(
        response.data,
        "binary",
      ).toString("base64")}`,
    };

    if (!this.scene.isActive()) return;

    const baseHeight = Math.max(this.cameras.main.width * 0.035, 30); // max(3.5vw,32px) // TODO: is this size really ok?
    const payload = new SpriteCluePayload(this, baseHeight);
    const foe = new Foe(this, timeout);
    foe.initialize(length, beWord, beClue, payload);
    payload.loadWord(beWord, texture);
    this.spotlight();
  }

  spotlight() {
    if (this.focusedFoe) return;
    if (this.foes.length < 1) return;
    this.focusedFoe = this.foes[0];
    this.focusedFoe.clue.spotlight();
  }
}
