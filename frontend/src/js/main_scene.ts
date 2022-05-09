import "phaser";

import Player from "./player";

import levenshtein from "damerau-levenshtein";

import Foe from "./foe";
import Typewriter from "./typewriter";
import HUD from "./hud";

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
  foes: Array<Foe>;
  player: Player;
  cluesGroup: Phaser.Physics.Arcade.Group;
  typewriter: Typewriter;
  acceptedWords: number;
  score: number;
  health: number;
  hud: HUD;
  gameTime: Phaser.Time.TimerEvent;
  uiDimensions: UIDimensions;
  music!: Phaser.Sound.BaseSound;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
    this.foes = [];
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

  async create(data: { music: Phaser.Sound.BaseSound }) {
    this.music = data.music;

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

    await this.afterCreate();
  }

  async afterCreate() {
    this.gameTime.paused = false;
  }

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
    this.foes.forEach((foe) => foe.destroy());
    this.sound.play("sfx_game_over");
    this.typewriter.setActive(false);
    this.typewriter.resetInputStatus();

    await this.afterEndGame();
  }

  async afterEndGame() {
    console.error("afterEndGame not implemented");
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

  submitTranscription(inputStatus: InputStatus) {
    console.debug(inputStatus);
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