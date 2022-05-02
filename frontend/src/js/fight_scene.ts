import "phaser";

import Spear from "./spear";
import Player from "./player";
import backend from "./backend";

// TODO: write interfaces
import levenshtein from "damerau-levenshtein";

import * as Types from "../../../backend/src/types";
import Foe from "./foe";
import Typewriter from "./typewriter";
import HUD from "./hud";
import BackgroundScene from "./background_scene";
import { SFX, MFX, SPR, SpriteSheets } from "./assets";

const DEVICE_KEY = "OETZIT/DEVICE_ID";

interface InputStatus {
  began_at: string;
  ended_at: string;
  typed: string;
  final: string;
  began_at_gmtm: number;
  ended_at_gmtm: number;
}

interface UIDimensions {
  kbdHeight: number;
  statsPadding: number;
  statsFontSize: string;
  statsHeight: number;
  inputPadding: number;
  inputFontSize: string;
  inputHeight: number;
  inputPosition: number;
  cluesBounds: Phaser.Geom.Rectangle;
}

export default class FightScene extends Phaser.Scene {
  foes: Array<Foe>;
  player: Player;
  cluesGroup: Phaser.Physics.Arcade.Group;
  beDevice: Types.Device;
  beGame: Types.Game;
  typewriter: Typewriter;
  acceptedWords: number;
  score: number;
  health: number;
  hud: HUD;
  gameTime: Phaser.Time.TimerEvent;
  uiDimensions: UIDimensions;
  music!: Phaser.Sound.BaseSound;
  spawner: Phaser.Time.TimerEvent;

  constructor() {
    super("fight");
    this.foes = [];
  }

  preload() {
    this.preloadSprites();
    this.preloadSoundsEffects();
    this.preloadMusicThemes();
  }

  preloadSoundsEffects() {
    this.load.audio("sfx_lo_beep", SFX.LoBeep);
    this.load.audio("sfx_md_beep", SFX.MdBeep);
    this.load.audio("sfx_hi_beep", SFX.HiBeep);
    this.load.audio("sfx_hit_critter", SFX.HitCritter);
    this.load.audio("sfx_hit_player", SFX.HitPlayer);
    this.load.audio("sfx_game_over", SFX.GameOver);
  }

  preloadMusicThemes() {
    this.load.audio("bkg_main_1", MFX.LoopOne);
    this.load.audio("bkg_main_2", MFX.LoopTwo);
    this.load.audio("bkg_main_3", MFX.LoopThree);
  }

  preloadSprites() {
    this.load.spritesheet("oezi", SPR.Oetzi, {
      frameWidth: 27,
      frameHeight: 35,
    });
    this.load.spritesheet("spear", SPR.SpearStill, {
      frameWidth: 31,
      frameHeight: 7,
    });
    this.load.spritesheet("spearhit", SPR.SpearWobble, {
      frameWidth: 14,
      frameHeight: 33,
    });

    this.load.spritesheet(SpriteSheets.BearWalk);
    this.load.spritesheet(SpriteSheets.BearRun);
    this.load.spritesheet(SpriteSheets.BoarWalk);
    this.load.spritesheet(SpriteSheets.BoarRun);
    this.load.spritesheet(SpriteSheets.DeerWalk);
    this.load.spritesheet(SpriteSheets.DeerRun);
    this.load.spritesheet(SpriteSheets.FoxWalk);
    this.load.spritesheet(SpriteSheets.FoxRun);
    this.load.spritesheet(SpriteSheets.RabbitWalk);
    this.load.spritesheet(SpriteSheets.RabbitRun);
    this.load.spritesheet(SpriteSheets.WolfWalk);
    this.load.spritesheet(SpriteSheets.WolfRun);
  }

  init() {
    this.score = 0;
    this.health = 100;
    this.acceptedWords = 0;

    this.uiDimensions = this.initUiDimensions();
    this.hud = new HUD(this, {
      statsPadding: this.uiDimensions.statsPadding,
      statsFontSize: this.uiDimensions.statsFontSize,
      inputPadding: this.uiDimensions.inputPadding,
      inputFontSize: this.uiDimensions.inputFontSize,
      inputPosition: this.uiDimensions.inputPosition,
    });
    this.hud.setHealth(this.health);
    this.hud.setScore(this.score);
    this.hud.setClock(0);

    this.events.on("pause", this.onPause.bind(this));
    this.events.on("resume", this.onResume.bind(this));
  }

  onPause() {
    this.concealClues();
    this.typewriter.setActive(false);
    this.music.pause();
    this.scene.launch("pause");
  }

  onResume() {
    this.uncoverClues();
    this.typewriter.setActive(true);
    this.music.play();
    this.scene.stop("pause");
  }

  initUiDimensions(): UIDimensions {
    const ch = this.cameras.main.height;
    const cw = this.cameras.main.width;
    const vh = ch * 0.01;
    const vw = cw * 0.01;

    const kbdHeight = Math.min(40 * vh, 48 * vw); // see max-height of .hg-theme-default

    const statsPadding = Math.min(1 * vw, 10);
    const statsFontSize = "max(3vw,20px)"; // never smaller than 20px for readability
    const statsHeight = Math.max(3 * vw, 20) * 1.4 + 2 * statsPadding;

    const inputPadding = Math.min(0.5 * vw, 5);
    const inputFontSize = "min(12vw,60px)"; // always fit ~12 chars comfortably in width
    const inputHeight = Math.min(12 * vw, 60) * 1.4 + 2 * inputPadding;
    const inputPosition = (ch - kbdHeight - 0.5 * inputHeight) / ch;

    const cluesBounds = new Phaser.Geom.Rectangle(
      5,
      statsHeight,
      cw - 2 * 15,
      ch - statsHeight - kbdHeight - inputHeight,
    );

    return {
      kbdHeight,
      statsPadding,
      statsFontSize,
      statsHeight,
      inputPadding,
      inputFontSize,
      inputHeight,
      inputPosition,
      cluesBounds,
    };
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
    this.time.delayedCall(0 * 60 * 1000, () => this.hud.announceWave("WAVE 1"));
    this.time.delayedCall(3 * 60 * 1000, () => this.hud.announceWave("WAVE 2"));
    this.time.delayedCall(6 * 60 * 1000, () => this.hud.announceWave("WAVE 3"));
    this.time.delayedCall(9 * 60 * 1000, () => this.hud.announceWave("WAVE 4"));
    this.time.delayedCall(12 * 60 * 1000, () =>
      this.hud.announceWave("FINAL WAVE"),
    );
  }

  async create(data: { music: Phaser.Sound.BaseSound }) {
    (this.scene.get("background") as BackgroundScene).atmosphere.play();

    this.music = data.music;
    this.planMusicChanges();

    this.planWaveAnnouncements();

    this.bindPauseShortcut();

    this.gameTime = this.time.addEvent({
      delay: Number.MAX_SAFE_INTEGER,
      paused: true,
    });

    this.initCluesGroup();

    this.createAnimations();

    this.physics.world.setBounds(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height - 30,
      false,
      false,
      false,
      true,
    );

    // NOTE: this helps w/ clue sprite overlap
    this.physics.world.setFPS(2 * this.game.loop.targetFps);

    this.physics.world.on(
      "worldbounds",
      function (
        body: Phaser.Physics.Arcade.Body,
        up: boolean,
        down: boolean,
        left: boolean,
        right: boolean,
      ) {
        body.gameObject.emit("hitWorldBounds", { up, down, left, right });
      },
    );

    this.player = new Player(this);

    // this.scale.displaySize.setAspectRatio(
    //   this.cameras.main.width / this.cameras.main.height,
    // );
    // this.scale.refresh();

    this.createAndBindTypewriter();

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

  createAnimations() {
    this.createAnimation("player_idle", "oezi", 1, 5);
    this.createAnimation("player_run", "oezi", 6, 13);
    this.createAnimation("spearAni", "spear", 0, 3);
    this.createAnimation("spearHitAni", "spearhit", 0, 8);

    const defaults: Phaser.Types.Animations.Animation = {
      frameRate: 10,
      repeat: -1,
    };
    this.anims.create({ key: "BearRun", frames: "BearRun", ...defaults });
    this.anims.create({ key: "BearWalk", frames: "BearWalk", ...defaults });
    this.anims.create({ key: "BoarRun", frames: "BoarRun", ...defaults });
    this.anims.create({ key: "BoarWalk", frames: "BoarWalk", ...defaults });
    this.anims.create({ key: "DeerRun", frames: "DeerRun", ...defaults });
    this.anims.create({ key: "DeerWalk", frames: "DeerWalk", ...defaults });
    this.anims.create({ key: "FoxRun", frames: "FoxRun", ...defaults });
    this.anims.create({ key: "FoxWalk", frames: "FoxWalk", ...defaults });
    this.anims.create({ key: "RabbitRun", frames: "RabbitRun", ...defaults });
    this.anims.create({ key: "Rabbitwalk", frames: "RabbitWalk", ...defaults });
    this.anims.create({ key: "WolfRun", frames: "WolfRun", ...defaults });
    this.anims.create({ key: "WolfWalk", frames: "WolfWalk", ...defaults });
  }

  createAnimation(key: string, refKey: string, from: number, to: number) {
    this.anims.create({
      key: key,
      frames: this.anims.generateFrameNumbers(refKey, {
        start: from,
        end: to,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  updateScore(delta: number) {
    this.score += delta;
    this.hud.setScore(this.score);
    this.hud.changeFlash(this.hud.score, delta > 0 ? 0xffff00 : 0xff0000);
  }

  updateHealth(delta: number) {
    this.health += delta;
    this.health = Math.max(this.health, 0);
    this.hud.setHealth(this.health);
    this.hud.changeFlash(this.hud.health, delta > 0 ? 0x00ff00 : 0xff0000);
    this.checkAlive();
  }

  update(time: number, delta: number): void {
    // TODO: something poissonian
    // console.log(time, delta);
    this.hud.setClock(this.getGameTime());
  }

  checkAlive() {
    if (this.health > 0) return;
    this.endGame();
  }

  async endGame() {
    this.beGame = (
      await backend.updateGame(this.beGame.id, {
        ended_at: new Date().toISOString(),
        ended_at_gmtm: this.getGameTime(),
        score: this.score,
      })
    ).data;
    this.spawner.remove();
    this.foes.forEach((foe) => foe.destroy());
    this.sound.play("sfx_game_over");
    this.typewriter.setActive(false);
    this.typewriter.resetInputStatus();
    this.scene.start("game_over", {
      music: this.music,
      words: this.acceptedWords,
      score: this.beGame.score,
      time: this.beGame.ended_at_gmtm,
    });
  }

  initCluesGroup() {
    this.cluesGroup = this.physics.add.group({
      collideWorldBounds: true,
      customBoundsRectangle: this.uiDimensions.cluesBounds,
      bounceY: 0.2,
      dragY: 180,
    });
    this.physics.add.collider(this.cluesGroup, this.cluesGroup);
  }

  findMatchingFoe(transcription: string) {
    let result: { similarity: number; match: Foe | null } = {
      similarity: -1,
      match: null,
    };
    if (this.foes.length < 1) return result;
    this.foes.forEach((foe) => {
      // TODO: accept case insensitive match w/ penalty?
      const similarity = levenshtein(
        transcription,
        foe.beWord.ocr_transcript,
      ).similarity;
      if (similarity < result.similarity) return;
      result = { similarity: similarity, match: foe };
    });
    // match ??= scene.foes[0]; // TODO: remove this
    // console.log(similarity, match.beWord.ocr_transcript);
    return result;
  }

  popFoe(foe) {
    this.foes.splice(this.foes.indexOf(foe), 1);
  }

  nthFibonacci(n: number) {
    return Math.round(Math.pow((1 + Math.sqrt(5)) / 2, n) / Math.sqrt(5));
  }

  submitTranscription(inputStatus: InputStatus) {
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
  }

  createAndBindTypewriter() {
    this.typewriter ??= new Typewriter(this.game.device.os.desktop);
    this.typewriter.setActive(true);
    this.typewriter.getGameTime = this.getGameTime.bind(this);
    this.typewriter.onSubmit = async (inputStatus) => {
      if (inputStatus.began_at === null) return;
      if (inputStatus.ended_at === null) return;
      if (inputStatus.began_at_gmtm === null) return;
      if (inputStatus.ended_at_gmtm === null) return;
      if (inputStatus.final === "") return;
      this.hud.setInput("");
      this.submitTranscription({
        began_at: inputStatus.began_at.toISOString(),
        ended_at: inputStatus.ended_at.toISOString(),
        typed: inputStatus.typed,
        final: inputStatus.final,
        began_at_gmtm: inputStatus.began_at_gmtm,
        ended_at_gmtm: inputStatus.ended_at_gmtm,
      });
    };
    this.typewriter.onChange = (inputStatus) => {
      this.sound.play("sfx_md_beep");
      this.hud.setInput(inputStatus.final);
    };
  }

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
    const maxLength = Math.round(6 + (18 - 6) * difficulty);

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
      await this.spawnFoe(length, duration);
    }

    this.spawner = this.time.delayedCall(delay, this.spawnFoes.bind(this));
  }

  async spawnFoe(length: number, timeout: number) {
    // TODO: this is a terrible pattern
    await new Foe(this, timeout).initialize(length);
  }

  concealClues() {
    this.foes.forEach((foe) => foe.clue.conceal());
  }

  uncoverClues() {
    this.foes.forEach((foe) => foe.clue.uncover());
  }

  getGameTime() {
    // NOTE: we don't need sub-ms precision.
    // NOTE: pretty please, don't access the timer directly.
    return Math.round(this.gameTime.getElapsed());
  }

  bindPauseShortcut() {
    if (this.game.device.os.desktop) {
      const escBinding = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.ESC,
      );
      escBinding.onDown = () => this.scene.pause();
    } else {
      const onPointerUp = (pointer: Phaser.Input.Pointer) => {
        const tapped =
          pointer.downY <
          this.cameras.main.height - this.uiDimensions.kbdHeight;
        if (tapped) this.scene.pause();
      };
      this.input.on("pointerup", onPointerUp);
    }
  }
}
