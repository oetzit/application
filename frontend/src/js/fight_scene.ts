import "phaser";

import Spear from "./spear";
import backend from "./backend";

// TODO: write interfaces
import levenshtein from "damerau-levenshtein";

import * as Types from "../../../backend/src/types";
import Foe from "./foe";
import Typewriter from "./typewriter";

const DEVICE_KEY = "OETZI/DEVICE_ID";

interface InputStatus {
  began_at: string;
  ended_at: string;
  typed: string;
  final: string;
}

interface HUD {
  score: Phaser.GameObjects.Text;
  input: Phaser.GameObjects.Text;
  health: Phaser.GameObjects.Text;
}

export default class FightScene extends Phaser.Scene {
  foes: Array<Foe>;
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  cluesGroup: Phaser.Physics.Arcade.Group;
  beDevice: Types.Device;
  beGame: Types.Game;
  typewriter: Typewriter;
  score: number;
  health: number;
  hud: HUD;

  constructor() {
    super("fight");
    this.foes = [];
    this.hud = {};
  }

  preload() {
    this.preloadSprites();
  }

  preloadSprites() {
    this.load.spritesheet("oezi", "assets/sprites/player/oezi.png", {
      frameWidth: 27,
      frameHeight: 35,
    });
    this.load.spritesheet("deer", "assets/sprites/player/deer.png", {
      frameWidth: 72,
      frameHeight: 52,
    });
    this.load.spritesheet("boar", "assets/sprites/player/boar.png", {
      frameWidth: 52,
      frameHeight: 28,
    });
    this.load.spritesheet("wolf", "assets/sprites/player/wolf.png", {
      frameWidth: 54,
      frameHeight: 35,
    });
    this.load.spritesheet("bear", "assets/sprites/player/bear.png", {
      frameWidth: 60,
      frameHeight: 31,
    });
    this.load.spritesheet("spear", "assets/sprites/player/spear.png", {
      frameWidth: 31,
      frameHeight: 7,
    });
    this.load.spritesheet("spearhit", "assets/sprites/player/spearhit.png", {
      frameWidth: 14,
      frameHeight: 33,
    });
  }

  init() {
    this.score = 0;
    this.health = 100;
    this.events.on("pause", this.concealClues.bind(this));
    this.events.on("resume", this.uncoverClues.bind(this));
  }

  async create() {
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

    this.createPlayer();

    // this.scale.displaySize.setAspectRatio(
    //   this.cameras.main.width / this.cameras.main.height,
    // );
    // this.scale.refresh();

    this.createHUD();
    this.createAndBindTypewriter();

    await this.initBeDevice();
    await this.initBeGame();

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
      })
    ).data;
  }

  createAnimations() {
    this.createAnimation("player_idle", "oezi", 1, 5);
    this.createAnimation("player_run", "oezi", 6, 13);
    this.createAnimation("deer_run", "deer", 0, 5);
    this.createAnimation("deer_idle", "deer", 6, 15);
    this.createAnimation("deer_walk", "deer", 16, 23);
    this.createAnimation("boar_run", "boar", 0, 5);
    this.createAnimation("boar_idle", "boar", 6, 13);
    this.createAnimation("boar_walk", "boar", 14, 22);
    this.createAnimation("wolf_run", "wolf", 0, 5);
    this.createAnimation("wolf_idle", "wolf", 6, 15);
    this.createAnimation("wolf_walk", "wolf", 16, 23);
    this.createAnimation("bear_run", "bear", 12, 16);
    this.createAnimation("bear_idle", "bear", 0, 11);
    this.createAnimation("bear_walk", "bear", 17, 24);
    this.createAnimation("spearAni", "spear", 0, 3);
    this.createAnimation("spearHitAni", "spearhit", 0, 8);
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

  createPlayer() {
    this.player = this.physics.add
      .sprite(0, 0, "oezi")
      .setScale(3)
      .setInteractive();
    this.player.setPosition(
      // NOTE: just outside the bound and above the ground
      this.cameras.main.width + 0.5 * this.player.displayWidth,
      this.cameras.main.height - 30 - 0.5 * this.player.displayHeight,
    );
    this.player.flipX = true;
    this.player.play({ key: "player_run" });
    this.player.setCollideWorldBounds(true);
    this.tweens.add({
      targets: this.player,
      x: this.cameras.main.width - this.player.displayWidth * 0.5,
      ease: "Power2",
      duration: 1000,
      onComplete: () => {
        this.player.play({ key: "player_run", repeat: -1 });
      },
    });
  }

  createHUD() {
    this.hud.input = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "",
      {
        font: "bold 64px Courier",
        color: "#ffffff",
      },
    );
    this.hud.input.setOrigin(0.5, 0.5);

    this.hud.score = this.add.text(10, 10, "", {
      font: "bold 48px Courier",
      color: "lightgreen",
    });
    this.hud.score.setOrigin(0, 0);
    this.updateScore(0);

    this.hud.health = this.add.text(this.cameras.main.width - 10, 10, "", {
      font: "bold 48px Courier",
      color: "orange",
    });
    this.hud.health.setOrigin(1, 0);
    this.updateHealth(0);
  }

  updateScore(delta: number) {
    this.score += delta;
    this.hud.score.text = "✪ " + this.score.toString();
  }

  updateHealth(delta: number) {
    this.health += delta;
    this.health = Math.max(this.health, 0);
    this.hud.health.text = this.health.toString() + " ❤";
    this.checkAlive();
  }

  checkAlive() {
    if (this.health > 0) return;
    this.endGame();
  }

  async endGame() {
    this.beGame = (
      await backend.updateGame(this.beGame.id, {
        ended_at: new Date().toISOString(),
      })
    ).data;
    this.foes.forEach((foe) => foe.destroy());
    this.scene.start("game_over");
  }

  showSubmitFeedback(color: string, input: string) {
    const text = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      input,
      {
        font: "bold 64px Courier",
        color: color,
      },
    );
    text.setOrigin(0.5, 0.5);
    this.tweens.add({
      targets: text,
      scaleX: 5,
      scaleY: 5,
      alpha: 0,
      ease: "Power2",
      duration: 500,
      onComplete: (_tween, [target]) => target.destroy(),
    });
  }

  initCluesGroup() {
    const bounds = new Phaser.Geom.Rectangle(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height / 2,
    );
    this.cluesGroup = this.physics.add.group({
      collideWorldBounds: true,
      customBoundsRectangle: bounds,
      bounceY: 0.2,
      dragY: 180,
    });
    this.physics.add.collider(this.cluesGroup, this.cluesGroup);
  }

  findMatchingFoe(transcription: string) {
    let result: { score: number; match: Foe | null } = {
      score: -1,
      match: null,
    };
    if (this.foes.length < 1) return result;
    this.foes.forEach((foe) => {
      // TODO: accept case insensitive match w/ penalty?
      const similarity = levenshtein(
        transcription,
        foe.beWord.ocr_transcript,
      ).similarity;
      if (similarity < result.score) return;
      result = { score: similarity, match: foe };
    });
    // match ??= scene.foes[0]; // TODO: remove this
    // console.log(similarity, match.beWord.ocr_transcript);
    return result;
  }

  popFoe(foe) {
    this.foes.splice(this.foes.indexOf(foe), 1);
  }

  submitTranscription(inputStatus: InputStatus) {
    // NOTE: this ain't async to avoid any UX delay
    const { score, match } = this.findMatchingFoe(inputStatus.final);
    backend.createShot(this.beGame.id, {
      clue_id: match?.beClue?.id || null,
      ...inputStatus,
    });
    if (match === null) {
      // NOOP
      this.showSubmitFeedback("#FFFFFF", inputStatus.final);
    } else if (score < 0.9) {
      // TODO: visual near misses based on score
      this.updateScore(-1);
      match.handleFailure();
      this.showSubmitFeedback("#FF0000", inputStatus.final);
      new Spear(this, this.player, undefined);
    } else {
      backend.updateClue(match.beClue.id, {
        ended_at: new Date().toISOString(),
      });
      this.updateScore(+10);
      this.popFoe(match);
      match.handleSuccess();
      this.showSubmitFeedback("#00FF00", inputStatus.final);
      new Spear(this, this.player, match.critter);
      // TODO: increase score
    }
  }

  createAndBindTypewriter() {
    this.typewriter ??= new Typewriter();
    if (this.game.device.os.desktop) {
      this.typewriter.setHidden(true);
      this.typewriter.setShiftModeHoldable();
    } else {
      this.typewriter.setHidden(false);
      this.typewriter.setShiftModeOneShot();
    }
    this.typewriter.onSubmit = async (inputStatus) => {
      if (inputStatus.began_at === null) return;
      if (inputStatus.ended_at === null) return;
      if (inputStatus.final === "") return;
      this.hud.input.text = "";
      this.submitTranscription({
        began_at: inputStatus.began_at.toISOString(),
        ended_at: inputStatus.ended_at.toISOString(),
        typed: inputStatus.typed,
        final: inputStatus.final,
      });
    };
    this.typewriter.onChange = (inputStatus) => {
      this.hud.input.text = inputStatus.final;
    };
  }

  async spawnFoes() {
    await this.spawnFoe();
    // TODO: think of a progression which makes sense
    const delay = Math.max(
      2000,
      (8 * 1000 * (60 * 1000 - this.time.now)) / 60 / 1000 + 2 * 1000,
    );
    this.time.delayedCall(delay, this.spawnFoes.bind(this));
  }

  async spawnFoe() {
    await new Foe(this).initialize();
  }

  concealClues() {
    this.foes.forEach((foe) => foe.clue.conceal());
  }

  uncoverClues() {
    this.foes.forEach((foe) => foe.clue.uncover());
  }
}
