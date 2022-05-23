import "phaser";
import levenshtein, { LevenshteinDistance } from "damerau-levenshtein";

import Foe from "./foe";
import HUD from "./hud";
import Player from "./player";
import Typewriter from "./typewriter";
import PauseScene from "./pause_scene";

export interface InputStatus {
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

export default class MainScene extends Phaser.Scene {
  typewriterEnabled!: boolean;
  tapoutEnabled!: boolean;
  lastTapoutTimestamp = 0;

  music!: Phaser.Sound.BaseSound;
  player!: Player;

  async create(data: { music: Phaser.Sound.BaseSound }) {
    this.music = data.music;

    this.createAnimations();

    this.resetGameState();

    this.createGameTime();
    this.resetGameTime();

    this.createUiDimensions();
    this.createHUD();
    this.resetHUD();

    this.bindPauseResumeEvents();
    this.bindPauseUserControls();

    this.createPhysics();
    this.initCluesGroup();

    this.player = new Player(this);

    // this.scale.displaySize.setAspectRatio(
    //   this.cameras.main.width / this.cameras.main.height,
    // );
    // this.scale.refresh();

    this.createAndBindTypewriter();

    this.setGameTimePaused(false);
    await this.beforeGameStart();
  }

  update() {
    this.updateClock();
  }

  async beforeGameStart() {
    console.error("beforeGameStart not implemented");
  }

  async endGame() {
    this.setGameTimePaused(true);
    this.foes.forEach((foe) => foe.destroy());
    this.sound.play("sfx_game_over");
    this.typewriter.setActive(false);
    this.typewriter.resetInputStatus();

    await this.afterGameEnd();
  }

  async afterGameEnd() {
    console.error("afterGameEnd not implemented");
  }

  //=[ Sprite animations ]======================================================

  createAnimations() {
    const defaults: Phaser.Types.Animations.Animation = {
      frameRate: 10,
      repeat: -1,
    };

    this.anims.create({
      key: "player_idle",
      frames: this.anims.generateFrameNumbers("Oetzi", {
        start: 1,
        end: 5,
      }),
      ...defaults,
    });
    this.anims.create({
      key: "player_run",
      frames: this.anims.generateFrameNumbers("Oetzi", {
        start: 6,
        end: 13,
      }),
      ...defaults,
    });

    this.anims.create({ key: "SpearStill", frames: "SpearStill", ...defaults });
    this.anims.create({
      key: "SpearWobble",
      frames: "SpearWobble",
      ...defaults,
      frameRate: 48,
    });

    this.anims.create({ key: "BearRun", frames: "BearRun", ...defaults });
    this.anims.create({ key: "BearWalk", frames: "BearWalk", ...defaults });
    this.anims.create({ key: "BoarRun", frames: "BoarRun", ...defaults });
    this.anims.create({ key: "BoarWalk", frames: "BoarWalk", ...defaults });
    this.anims.create({ key: "DeerRun", frames: "DeerRun", ...defaults });
    this.anims.create({ key: "DeerWalk", frames: "DeerWalk", ...defaults });
    this.anims.create({ key: "FoxRun", frames: "FoxRun", ...defaults });
    this.anims.create({ key: "FoxWalk", frames: "FoxWalk", ...defaults });
    this.anims.create({ key: "HorseRun", frames: "HorseRun", ...defaults });
    this.anims.create({ key: "HorseWalk", frames: "HorseWalk", ...defaults });
    this.anims.create({ key: "RabbitRun", frames: "RabbitRun", ...defaults });
    this.anims.create({ key: "RabbitWalk", frames: "RabbitWalk", ...defaults });
    this.anims.create({ key: "WolfRun", frames: "WolfRun", ...defaults });
    this.anims.create({ key: "WolfWalk", frames: "WolfWalk", ...defaults });
  }

  //=[ Game time ]==============================================================

  gameTime!: Phaser.Time.TimerEvent;

  getGameTime() {
    // NOTE: we round because we don't need sub-ms precision.
    return Math.round(this.gameTime.getElapsed());
  }

  createGameTime() {
    this.gameTime = this.time.addEvent({});
  }

  resetGameTime() {
    this.gameTime.reset({
      delay: Number.MAX_SAFE_INTEGER,
      paused: true,
    });
  }

  setGameTimePaused(paused: boolean) {
    this.gameTime.paused = paused;
  }

  //=[ Pause/resume ]===========================================================

  bindPauseResumeEvents() {
    this.events.on("pause", this.onPause.bind(this));
    this.events.on("resume", this.onResume.bind(this));
  }

  onPause() {
    this.concealClues();
    this.typewriter.setActive(false);
    this.music.pause();
  }

  concealClues() {
    this.foes.forEach((foe) => foe.clue.conceal());
  }

  onResume() {
    this.uncoverClues();
    this.typewriter.setActive(this.typewriterEnabled);
    this.music.resume();
  }

  uncoverClues() {
    this.foes.forEach((foe) => foe.clue.uncover());
  }

  bindPauseUserControls() {
    if (this.game.device.os.desktop) {
      const escBinding = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.ESC,
      );
      escBinding.onDown = () => {
        if (!this.tapoutEnabled) return;
        (this.scene.get("pause") as PauseScene).focusPause(true);
      };
    } else {
      const onPointerUp = (pointer: Phaser.Input.Pointer) => {
        if (!this.tapoutEnabled) return;
        const isFastEnough = pointer.time - this.lastTapoutTimestamp < 300;
        if (isFastEnough) {
          (this.scene.get("pause") as PauseScene).focusPause(true);
        } else {
          this.lastTapoutTimestamp = pointer.time;
        }
      };
      this.input.on("pointerup", onPointerUp);
    }
  }

  setTypewriterEnabled(enabled: boolean) {
    this.typewriterEnabled = enabled;
    this.typewriter.setActive(this.typewriterEnabled);
  }

  //=[ HUD and UI dimensions ]==================================================

  uiDimensions!: UIDimensions;
  hud!: HUD;

  createUiDimensions() {
    this.uiDimensions = this.computeUiDimensions(this.cameras.main);
  }

  createHUD() {
    this.hud = new HUD(this, {
      statsPadding: this.uiDimensions.statsPadding,
      statsFontSize: this.uiDimensions.statsFontSize,
      inputPadding: this.uiDimensions.inputPadding,
      inputFontSize: this.uiDimensions.inputFontSize,
      inputPosition: this.uiDimensions.inputPosition,
    });
  }

  resetHUD() {
    this.hud.setHealth(this.health);
    this.hud.setScore(this.score);
    this.hud.setClock(0);
  }

  computeUiDimensions(camera: Phaser.Cameras.Scene2D.Camera): UIDimensions {
    const ch = camera.height;
    const cw = camera.width;
    const vh = ch * 0.01;
    const vw = cw * 0.01;

    const kbdHeight = Math.min(40 * vh, 48 * vw); // see max-height of .hg-theme-default

    const statsPadding = Math.min(1 * vw, 10);
    const statsFontSize = "max(3vw,20px)"; // never smaller than 20px for readability
    const statsHeight = Math.max(3 * vw, 20) * 1.4 + 2 * statsPadding;

    const inputPadding = 0; //Math.min(0.5 * vw, 0);
    const inputFontSize = "min(12vw,48px)"; // always fit ~12 chars comfortably in width
    const inputHeight = Math.min(12 * vw, 48) * 1.2 + 2 * inputPadding;
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

  //=[ Physics ]================================================================

  cluesGroup!: Phaser.Physics.Arcade.Group;

  createPhysics() {
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

  //=[ Game state ]=============================================================

  foes!: Array<Foe>;
  score!: number;
  health!: number;
  acceptedWords!: number;

  resetGameState() {
    this.foes = [];
    this.score = 0;
    this.health = 100;
    this.acceptedWords = 0;
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
    if (this.health <= 25) this.hud.startLowHealthPulse();
    if (this.health <= 0) this.endGame();
  }

  updateClock() {
    this.hud.setClock(this.getGameTime());
  }

  popFoe(foe: Foe) {
    this.foes.splice(this.foes.indexOf(foe), 1);
  }

  //=[ Matching logic ]=========================================================

  findMatchingFoe(transcription: string) {
    let result: {
      casefullLevenshtein: LevenshteinDistance;
      caselessLevenshtein: LevenshteinDistance;
      match: Foe | null;
    } = {
      match: null,
      casefullLevenshtein: {
        steps: NaN,
        relative: Infinity,
        similarity: -Infinity,
      },
      caselessLevenshtein: {
        steps: NaN,
        relative: Infinity,
        similarity: -Infinity,
      },
    };

    // NOTE: we iterate in order, so older words are preferred
    this.foes.forEach((foe) => {
      // NOTE: case insensitive match is done by lowercasing because
      // "ẞ".toLowerCase() == 'ß' (square and fair)
      // "ß".toUpperCase() == 'SS' (weird)
      const caselessLevenshtein = levenshtein(
        transcription.toLowerCase(),
        foe.beWord.ocr_transcript.toLowerCase(),
      );

      const casefullLevenshtein = levenshtein(
        transcription,
        foe.beWord.ocr_transcript,
      );

      // NOTE: bare minimum threshold for match
      if (caselessLevenshtein.similarity < 0.5) return;

      // NOTE: caselessLevenshtein.similarity >= casefullLevenshtein.similarity
      const caselessMatchImproved =
        caselessLevenshtein.similarity > result.caselessLevenshtein.similarity;
      const casefullMatchImproved =
        casefullLevenshtein.similarity > result.casefullLevenshtein.similarity;

      //  CL/CF - = +
      //      -     ?  -> CL-/CF+ should be impossible
      //      =     Y  -> CL=/CF+ means improved casing
      //      + Y Y Y  -> CL+ means more correct letters
      if (!caselessMatchImproved && !casefullMatchImproved) return;

      result = { match: foe, casefullLevenshtein, caselessLevenshtein };
    });
    return result;
  }

  //=[ Typewriter and submission ]==============================================

  typewriter!: Typewriter;

  createAndBindTypewriter() {
    this.typewriter ??= new Typewriter(this.game.device.os.desktop);
    this.typewriter.setActive(this.typewriterEnabled);
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

  submitTranscription(_inputStatus: InputStatus) {
    console.error("submitTranscription not implemented");
    return undefined;
  }
}
