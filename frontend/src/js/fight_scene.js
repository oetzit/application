import Phaser from "phaser";

import nr from "newton-raphson-method";

import Foe from "./foe";
import backend from "./backend";

import levenshtein from "damerau-levenshtein";

const fightScene = new Phaser.Scene("fight");

fightScene.foes = [];
fightScene.spears = [];
fightScene.preload = preload;
fightScene.create = create;
fightScene.update = update;

function setAnimation(obj, idleKey) {
  obj.play({ key: idleKey, repeat: -1 });
}

function createAnim(key, refKey, from, to) {
  fightScene.anims.create({
    key: key,
    frames: fightScene.anims.generateFrameNumbers(refKey, {
      start: from,
      end: to,
    }),
    frameRate: 10,
    repeat: -1,
  });
}

function preload() {
  this.scale.scaleMode = Phaser.ScaleModes.LINEAR;
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

function create() {
  // Draw background forest
  ["b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "b10"].forEach(
    (textureKey) => {
      this.add
        .tileSprite(
          0,
          0,
          this.cameras.main.width,
          this.cameras.main.height,
          textureKey,
        )
        .setOrigin(0, 0.2)
        .setScale(1.3);
    },
  );

  // Draw foreground grass
  this.add
    .tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, "b11")
    .setAlpha(0.6)
    .setOrigin(0, -0.03);

  createAnim("player_idle", "oezi", 1, 5);
  createAnim("player_run", "oezi", 6, 13);
  createAnim("deer_run", "deer", 0, 5);
  createAnim("deer_idle", "deer", 6, 15);
  createAnim("deer_walk", "deer", 16, 23);
  createAnim("boar_run", "boar", 0, 5);
  createAnim("boar_idle", "boar", 6, 13);
  createAnim("boar_walk", "boar", 14, 22);
  createAnim("wolf_run", "wolf", 0, 5);
  createAnim("wolf_idle", "wolf", 6, 15);
  createAnim("wolf_walk", "wolf", 16, 23);
  createAnim("bear_run", "bear", 12, 16);
  createAnim("bear_idle", "bear", 0, 11);
  createAnim("bear_walk", "bear", 17, 24);
  createAnim("spearAni", "spear", 0, 3);
  createAnim("spearHitAni", "spearhit", 0, 8);
  createAnim("hit", "hit", 0, 9);
  createAnim("missing", "miss", 0, 6);

  this.ground = this.physics.add
    .staticImage(0, this.cameras.main.height - 25, "ground")
    .setScale(1)
    .refreshBody();
  this.ground.setImmovable(true);
  this.ground.body.allowGravity = false;

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
      gameStart(this);
    },
  });

  this.scale.displaySize.setAspectRatio(
    this.cameras.main.width / this.cameras.main.height,
  );
  this.scale.refresh();
  initAndBindGuessPreview(this);
}

const LETTERS_KEYCODES = new Set([
  Phaser.Input.Keyboard.KeyCodes.SPACE,
  Phaser.Input.Keyboard.KeyCodes.A,
  Phaser.Input.Keyboard.KeyCodes.B,
  Phaser.Input.Keyboard.KeyCodes.C,
  Phaser.Input.Keyboard.KeyCodes.D,
  Phaser.Input.Keyboard.KeyCodes.E,
  Phaser.Input.Keyboard.KeyCodes.F,
  Phaser.Input.Keyboard.KeyCodes.G,
  Phaser.Input.Keyboard.KeyCodes.H,
  Phaser.Input.Keyboard.KeyCodes.I,
  Phaser.Input.Keyboard.KeyCodes.J,
  Phaser.Input.Keyboard.KeyCodes.K,
  Phaser.Input.Keyboard.KeyCodes.L,
  Phaser.Input.Keyboard.KeyCodes.M,
  Phaser.Input.Keyboard.KeyCodes.N,
  Phaser.Input.Keyboard.KeyCodes.O,
  Phaser.Input.Keyboard.KeyCodes.P,
  Phaser.Input.Keyboard.KeyCodes.Q,
  Phaser.Input.Keyboard.KeyCodes.R,
  Phaser.Input.Keyboard.KeyCodes.S,
  Phaser.Input.Keyboard.KeyCodes.T,
  Phaser.Input.Keyboard.KeyCodes.U,
  Phaser.Input.Keyboard.KeyCodes.V,
  Phaser.Input.Keyboard.KeyCodes.W,
  Phaser.Input.Keyboard.KeyCodes.X,
  Phaser.Input.Keyboard.KeyCodes.Y,
  Phaser.Input.Keyboard.KeyCodes.Z,
  219, // ß
  186, // ü
  192, // ö
  222, // ä
]);

function initAndBindGuessPreview(scene) {
  var textEntry = scene.add.text(10, scene.cameras.main.height / 2 - 32, "", {
    font: "bold 64px Courier",
    fill: "#ffffff",
  });
  scene.input.keyboard.on("keydown", function (event) {
    if (LETTERS_KEYCODES.has(event.keyCode)) {
      textEntry.text += event.key;
    } else if (
      event.keyCode === Phaser.Input.Keyboard.KeyCodes.BACKSPACE &&
      textEntry.text.length > 0
    ) {
      textEntry.text = textEntry.text.substr(0, textEntry.text.length - 1);
    } else if (
      event.keyCode === Phaser.Input.Keyboard.KeyCodes.ENTER &&
      textEntry.text.length > 0
    ) {
      submitTranscription(textEntry.text, scene);
      textEntry.text = textEntry.text.substr(0, 0);
    }
  });
}

function shootSpear(enemy, hit, scene = fightScene) {
  let message = scene.add
    .sprite(scene.cameras.main.width / 2, scene.cameras.main.height / 2)
    .setScale(1);

  if (!hit) {
    message.play({ key: "missing", repeat: 1 });
    message.on("animationcomplete", () => {
      message.anims.remove("miss");
      message.destroy();
    });
  } else {
    let message = scene.add
      .sprite(scene.cameras.main.width / 2, scene.cameras.main.height / 2)
      .setScale(1);
    message.play({ key: "hit", repeat: 1 });
    message.on("animationcomplete", () => {
      message.anims.remove("hit");
      message.destroy();
    });
    // TODO: ew.
    scene.foes.splice(scene.foes.indexOf(enemy), 1);
  }

  let spear = scene.add.sprite(scene.player.x, scene.player.y, "spear");
  scene.spears.push(spear);
  scene.physics.world.enable(spear);
  scene.physics.add.collider(spear, scene.ground);
  spear.body.setBounce(0.2);

  const dx = scene.player.x - enemy.x;
  const dy = 0;
  const v = 450; // MAGIC NUMBER
  const w = 100;
  const g = 200;
  // TODO: maybe introduce damping
  // TODO: expand and use analytic derivative
  const f = (theta) =>
    2 * dy * Math.pow(w - v * Math.cos(theta), 2) +
    2 * v * Math.sin(theta) * (w - v * Math.cos(theta)) * dx +
    g * Math.pow(dx, 2);

  const theta = nr(f, Math.PI, {
    verbose: true,
    maxIterations: 100,
  });

  const t = dx / (w - v * Math.cos(theta));

  if (theta) {
    spear.body.setVelocity(v * Math.cos(theta), v * Math.sin(theta));
  }

  scene.physics.add.overlap(spear, enemy, (player, nemico) => {
    scene.physics.world.removeCollider(this);
    // TODO: fancy bounce
    scene.spears.splice(scene.spears.indexOf(spear), 1);
    spear.destroy();
    // TODO: refactor into flee method
    nemico.play(nemico.species + "_run");
    nemico.flipX = false;
    nemico.body.setVelocity(-200, 0);
    setTimeout(() => nemico.destroy(), 2000);
  });

  spear.scale = 2;
  spear.anims.play("spearAni");
}

function submitTranscription(transcription, scene) {
  if (scene.foes.length < 1) return;

  let similarity = 0;
  let match = null;

  scene.foes.forEach((foe) => {
    const s = levenshtein(
      transcription.toLowerCase(),
      foe.word.ocr_transcript.toLowerCase(),
    ).similarity;
    if (s < similarity) return;
    similarity = s;
    match = foe;
  });

  console.log(similarity, match.word.ocr_transcript);

  // TODO: we can have near misses depending on similarity!
  let hit = similarity >= 0.9;
  let enemy = match;

  shootSpear(enemy.animalSprite, hit);
}

function gameStart(scene) {
  let waitTime = 200;
  setTimeout(() => {
    dispatchEnemy(scene);
  }, waitTime);
}

function dispatchEnemy(scene) {
  backend.post("GetImage", {}).then(function (response) {
    new Foe(scene, response.data);
  });
}

function update() {
  this.spears.forEach((spear) => {
    spear.setRotation(spear.body.velocity.angle());
  });
}

export default fightScene;
