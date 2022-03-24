import "phaser";

import Spear from "./spear";
import backend from "./backend";

// TODO: write interfaces
import levenshtein from "damerau-levenshtein";

import * as Types from "../../../backend/src/types";
import Foe from "./foe";
import Typewriter from "./typewriter";

interface InputStatus {
  began_at: string | null;
  ended_at: string | null;
  typed: string;
  final: string;
}

export default class FightScene extends Phaser.Scene {
  foes: Array<Foe>;
  ground: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  cluesGroup: Phaser.Physics.Arcade.Group;
  beGame: Types.Game;
  inputStatus: InputStatus;
  typewriter: Typewriter;

  constructor() {
    super("fight");
    this.foes = [];
  }

  preload() {
    this.preloadBackground();

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
    this.load.spritesheet("hit", "assets/sprites/player/hit-sheet.png", {
      frameWidth: 469,
      frameHeight: 79,
    });
    this.load.spritesheet("miss", "assets/sprites/player/misssing-sheet.png", {
      frameWidth: 466,
      frameHeight: 76,
    });
  }

  async create() {
    this.inputStatus = {
      typed: "",
      final: "",
    };
    this.initCluesGroup();
    this.createBackground();

    createAnim(this, "player_idle", "oezi", 1, 5);
    createAnim(this, "player_run", "oezi", 6, 13);
    createAnim(this, "deer_run", "deer", 0, 5);
    createAnim(this, "deer_idle", "deer", 6, 15);
    createAnim(this, "deer_walk", "deer", 16, 23);
    createAnim(this, "boar_run", "boar", 0, 5);
    createAnim(this, "boar_idle", "boar", 6, 13);
    createAnim(this, "boar_walk", "boar", 14, 22);
    createAnim(this, "wolf_run", "wolf", 0, 5);
    createAnim(this, "wolf_idle", "wolf", 6, 15);
    createAnim(this, "wolf_walk", "wolf", 16, 23);
    createAnim(this, "bear_run", "bear", 12, 16);
    createAnim(this, "bear_idle", "bear", 0, 11);
    createAnim(this, "bear_walk", "bear", 17, 24);
    createAnim(this, "spearAni", "spear", 0, 3);
    createAnim(this, "spearHitAni", "spearhit", 0, 8);
    createAnim(this, "hit", "hit", 0, 9);
    createAnim(this, "missing", "miss", 0, 6);

    this.ground = this.physics.add
      .staticImage(0, this.cameras.main.height - 25, "ground")
      .refreshBody()
      .setImmovable(true);
    // TODO: re-enable
    //this.ground.body.allowGravity = false;

    this.player = this.physics.add
      .sprite(
        this.cameras.main.width + 300,
        this.cameras.main.height - 100,
        "oezi",
      )
      .setScale(3)
      .setInteractive();

    this.player.flipX = true;

    this.player.play({ key: "player_run" });

    this.physics.add.collider(this.player, this.ground);

    this.tweens.add({
      targets: this.player,
      x: this.cameras.main.width - 80,
      ease: "Power2",
      duration: 2000,
      onComplete: () => {
        setAnimation(this.player, "player_idle");
      },
    });

    this.scale.displaySize.setAspectRatio(
      this.cameras.main.width / this.cameras.main.height,
    );
    this.scale.refresh();
    this.initAndBindGuessPreview();

    this.beGame = (await backend.createGame()).data;
    this.beGame = (
      await backend.updateGame(this.beGame.id, {
        began_at: new Date().toISOString(),
        ended_at: null,
      })
    ).data;

    // gameStart(this);
  }

  showMissMessage() {
    const message = this.add
      .sprite(
        this.cameras.main.width / 2,
        (3 * this.cameras.main.height) / 4,
        "miss",
      )
      .setScale(1);
    message.play({ key: "missing", repeat: 1 });
    message.on("animationcomplete", () => {
      message.anims.remove("miss");
      message.destroy();
    });
  }

  showHitMessage() {
    const message = this.add
      .sprite(
        this.cameras.main.width / 2,
        (3 * this.cameras.main.height) / 4,
        "hit",
      )
      .setScale(1);
    message.play({ key: "hit", repeat: 1 });
    message.on("animationcomplete", () => {
      message.anims.remove("hit");
      message.destroy();
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
      const similarity = levenshtein(
        transcription.toLowerCase(),
        foe.beWord.ocr_transcript.toLowerCase(),
      ).similarity;
      if (similarity < result.score) return;
      result = { score: similarity, match: foe };
    });
    // match ??= scene.foes[0]; // TODO: remove this
    // console.log(similarity, match.beWord.ocr_transcript);
    return result;
  }

  submitTranscription(inputStatus: InputStatus) {
    const { score, match } = this.findMatchingFoe(inputStatus.final);
    // TODO: visual near misses based on score
    if (match === null) {
      // NOOP
    } else if (score < 0.9) {
      match.handleFailure();
      this.showMissMessage();
      new Spear(this, this.player, undefined);
    } else {
      this.foes.splice(this.foes.indexOf(match), 1);
      match.handleSuccess();
      this.showHitMessage();
      new Spear(this, this.player, match.critter);
    }
  }

  initAndBindGuessPreview() {
    const textEntry = this.add.text(100, this.cameras.main.height / 2, "", {
      font: "bold 64px Courier",
      color: "#ffffff",
    });
    this.typewriter = new Typewriter();
    this.typewriter.setHidden(this.game.device.os.desktop);
    this.typewriter.onSubmit = (inputStatus) => {
      if (inputStatus.began_at === null) return;
      if (inputStatus.ended_at === null) return;
      if (inputStatus.final === "") return;
      this.submitTranscription({
        began_at: inputStatus.began_at.toISOString(),
        ended_at: inputStatus.ended_at.toISOString(),
        typed: inputStatus.typed,
        final: inputStatus.final,
      });
      textEntry.text = "";
    };
    this.typewriter.onChange = (inputStatus) => {
      textEntry.text = inputStatus.final;
    };
  }

  preloadBackground() {
    this.load.image("b0", "assets/background_layers/Layer_0011_0.png");
    this.load.image("b1", "assets/background_layers/Layer_0010_1.png");
    this.load.image("b2", "assets/background_layers/Layer_0009_2.png");
    this.load.image("b3", "assets/background_layers/Layer_0008_3.png");
    this.load.image("b4", "assets/background_layers/Layer_0007_Lights.png");
    this.load.image("b5", "assets/background_layers/Layer_0006_4.png");
    this.load.image("b6", "assets/background_layers/Layer_0005_5.png");
    this.load.image("b7", "assets/background_layers/Layer_0004_Lights.png");
    this.load.image("b8", "assets/background_layers/Layer_0003_6.png");
    this.load.image("b9", "assets/background_layers/Layer_0002_7.png");
    this.load.image("b10", "assets/background_layers/Layer_0001_8.png");
    this.load.image("b11", "assets/background_layers/Layer_0000_9.png");
    this.load.image("logo", "assets/background_layers/Logo.png");
    this.load.image("ground", "assets/background_layers/ground.png");
  }

  createBackground() {
    ["b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "b10"].forEach(
      (textureKey) => {
        const scale =
          this.cameras.main.height /
          this.textures.get(textureKey).getSourceImage().height;
        this.add
          .tileSprite(
            0,
            0,
            this.cameras.main.width / scale,
            this.cameras.main.height / scale,
            textureKey,
          )
          .setOrigin(0)
          .setScale(scale);
      },
    );
  }
}

// TODO: remove any
function setAnimation(obj: any, idleKey: any) {
  obj.play({ key: idleKey, repeat: -1 });
}

function createAnim(scene: any, key: any, refKey: any, from: any, to: any) {
  scene.anims.create({
    key: key,
    frames: scene.anims.generateFrameNumbers(refKey, {
      start: from,
      end: to,
    }),
    frameRate: 10,
    repeat: -1,
  });
}

function gameStart(scene: any) {
  spawn(scene);
}

async function spawn(scene: any) {
  await spawnFoe(scene);
  scene.time.now;
  const delay =
    (8 * 1000 * (60 * 1000 - scene.time.now)) / 60 / 1000 + 2 * 1000;
  // setTimeout(() => spawn(scene), Math.max(delay, 2000));
  setTimeout(() => spawn(scene), 10000);
}

async function spawnFoe(scene: any) {
  await new Foe(scene).initialize();
}
