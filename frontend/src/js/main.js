import * as Phaser from "phaser";
import axios from "axios";
import path from "path";

const BACKEND_URL = new URL(process.env.BACKEND_URL);
const backendEndpointURL = (endpoint) =>
  new URL(path.join(BACKEND_URL.pathname, endpoint), BACKEND_URL);

let config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  pixelArt: true,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  scaleMode: Phaser.Scale.FIT,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create, // update: updateScene
  },
};

let game = new Phaser.Game(config);

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

let gameRunning = false;
let player;
let scene;
let imageInUse = [];
let enemyNumber = 0;
let ground;
let consecutiveMissing = 0;
let onscreenEnemies = [];

/* game params */
let enemies = ["bear", "wolf", "deer", "boar"];
let maxEnemyNumber = 4;
let enemiesSpeed = 50000;
/**************/

function create() {
  scene = this;

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

  ground = this.physics.add
    .staticImage(0, this.cameras.main.height - 25, "ground")
    .setScale(1)
    .refreshBody();
  ground.setImmovable(true);
  ground.body.allowGravity = false;

  player = this.physics.add
    .sprite(
      this.cameras.main.width + 300,
      this.cameras.main.height - 100,
      "oezi",
    )
    .setScale(3)
    .setInteractive();

  player.flipX = true;

  player.play({ key: "player_run" });

  this.physics.add.collider(player, ground);

  let tween = this.tweens.add({
    targets: player,
    x: this.cameras.main.width - 80,
    ease: "Power2",
    duration: 2000,
    onComplete: function () {
      setAnimation(player, "player_idle");
      gameRunning = true;
      gameStart(this.parent.scene);
    },
  });

  this.scale.displaySize.setAspectRatio(
    this.cameras.main.width / this.cameras.main.height,
  );
  this.scale.refresh();
  initAndBindGuessPreview(this);
}

function createAnim(key, refKey, from, to) {
  scene.anims.create({
    key: key,
    frames: scene.anims.generateFrameNumbers(refKey, { start: from, end: to }),
    frameRate: 10,
    repeat: -1,
  });
}

function gameStart(scene) {
  let waitTime = 200;
  for (let i = 0; i < maxEnemyNumber; i++) {
    setTimeout(() => {
      dispatchEnemy(scene);
    }, waitTime);
    waitTime += Math.floor(Math.random() * 4000 + 4000);
  }
}

function dispatchEnemy(scene) {
  let e = new enemy();
  onscreenEnemies.push(e);

  axios
    .post(backendEndpointURL("GetImage"), {
      sessionImages: imageInUse,
    })
    .then(function (response) {
      e.refData = response.data;
      imageInUse.push(e.refData.id);

      const imageData = `data:image/png;base64,${response.data.image}`;
      scene.textures.addBase64(`WORD-${response.data.id}`, imageData);

      scene.textures.once(
        "addtexture",
        function () {
          e.run((v) => {
            imageInUse.splice(imageInUse.indexOf(e.refData.id), 1);
            if (gameRunning) {
              setTimeout(() => {
                dispatchEnemy(scene);
              }, Math.floor(Math.random() * 10000 + 3000));
            }
          });
        },
        scene,
      );
    });
}

class enemy {
  refData = null;

  run(callback) {
    let me = this;
    enemyNumber++;
    let randomEnemyType = enemies[Math.floor(Math.random() * 4 + 0)];

    let scale = 2;
    if (randomEnemyType === "deer") {
      scale = 2.5;
    } else if (randomEnemyType === "bear") {
      scale = 3;
    }

    let flag = scene.add.sprite(400, 300, `WORD-${this.refData.id}`);
    let enemy = scene.physics.add
      .sprite(-100, scene.cameras.main.height - 100, randomEnemyType)
      .setScale(scale)
      .setInteractive();

    this.sprite = enemy;

    enemy.typeName = randomEnemyType;
    scene.physics.add.collider(enemy, ground);
    enemy.flipX = true;

    setAnimation(enemy, enemy.typeName + "_walk");
    // TODO: bring animal below grass

    enemy.movement = scene.tweens.add({
      targets: enemy,
      x: scene.cameras.main.width + 300,
      duration: enemiesSpeed,
      onComplete: function () {
        enemy.destroy();
        callback(me);
      },
      onStop: function () {},
    });

    // here to implement health
    scene.physics.add.overlap(player, enemy, (p, nemico) => {
      nemico.disableInteractive();
      nemico.body.enable = false;
      nemico.movement.pause();
      nemico.play(nemico.typeName + "_idle");
      setTimeout(() => {
        nemico.play(nemico.typeName + "_run");
        nemico.movement.stop();
        scene.tweens.add({
          targets: nemico,
          x: scene.cameras.main.width + 100,
          duration: 2000,
          onComplete: function () {
            nemico.destroy();
            callback(me);
          },
        });
      }, 3000);
    });
  }
}

function setAnimation(obj, idleKey) {
  obj.play({ key: idleKey, repeat: -1 });
}

function initAndBindGuessPreview(scene) {
  var textEntry = scene.add.text(10, scene.cameras.main.height / 2 - 32, "", {
    font: "bold 64px Courier",
    fill: "#ffffff",
  });
  scene.input.keyboard.on("keydown", function (event) {
    if (
      event.keyCode === Phaser.Input.Keyboard.KeyCodes.BACKSPACE &&
      textEntry.text.length > 0
    ) {
      textEntry.text = textEntry.text.substr(0, textEntry.text.length - 1);
    } else if (
      event.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE ||
      (event.keyCode >= Phaser.Input.Keyboard.KeyCodes.A &&
        event.keyCode <= Phaser.Input.Keyboard.KeyCodes.Z)
    ) {
      textEntry.text += event.key;
    } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ENTER) {
      submitTranscription(textEntry.text);
      textEntry.text = textEntry.text.substr(0, 0);
    }
  });
}

function shootSpear(enemy, hit) {
  let startPoint = new Phaser.Math.Vector2(player.x, player.y);
  let controlPoint1 = new Phaser.Math.Vector2(
    enemy.x + (player.x - enemy.x) / 2,
    scene.cameras.main.height - (player.x - enemy.x),
  );

  let endPoint = new Phaser.Math.Vector2(
    enemy.x + enemy.width * 1.6,
    scene.cameras.main.height - 60,
  );
  let message = scene.add
    .sprite(scene.cameras.main.width / 2, scene.cameras.main.height / 2)
    .setScale(1);

  // hit / missing <--- message
  if (!hit) {
    endPoint = new Phaser.Math.Vector2(-500, scene.cameras.main.height - 60);
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
  }

  let curve = new Phaser.Curves.QuadraticBezier(
    startPoint,
    controlPoint1,
    endPoint,
  );

  let graphics = scene.add.graphics();
  graphics.lineStyle(1, 0xff00ff, 1);

  // curve.draw(graphics); // decomment to see the trajectory

  let spear = scene.add.follower(curve);

  // console.log(player.x + " " + enemy.x);
  if (hit) {
    spear.startFollow({
      positionOnPath: true,
      duration: (scene.cameras.main.width - enemy.x) * 3,
      rotateToPath: true,
      verticalAdjust: true,
      scale: 3,
      onComplete: (x, y) => {
        console.log("done");
        let spearHitObj = scene.add
          .sprite(
            enemy.x + enemy.width * 1.6 - 10,
            scene.cameras.main.height - 60,
          )
          .setScale(2);
        setAnimation(spearHitObj, "spearHitAni");
        spear.anims.stop("spearAni");
        spear.anims.remove("spearAni");
        spear.destroy();
        setTimeout(() => {
          enemy.flipX = false;
          setAnimation(enemy, enemy.typeName + "_run");
          enemy.movement.stop();
          scene.tweens.add({
            targets: enemy,
            x: -500,
            duration: 5000,
            onComplete: function () {
              enemy.destroy();
              //callback(enemy); // ???
            },
          });
        }, 3000);
        setTimeout(() => {
          spearHitObj.destroy();
        }, 4000);
      },
    });
  } else {
    enemy.setInteractive();
    enemy.movement.resume();
    setAnimation(enemy, enemy.typeName + "_walk");
    spear.startFollow({
      positionOnPath: true,
      duration: 3000,
      rotateToPath: true,
      verticalAdjust: true,
      scale: 3,
    });
  }

  spear.scale = 2;
  spear.anims.play("spearAni");
}

function submitTranscription(transcription) {
  // TODO: guess the enemy if any
  const enemy = onscreenEnemies[0].sprite;

  let hit = true;
  enemy.disableInteractive();
  // here invoke image
  enemy.movement.pause();
  setAnimation(enemy, enemy.typeName + "_idle");

  // let beginTime = new Date().getTime();
  // let endTime = new Date().getTime();
  // let deltaTime = endTime - beginTime;

  hit = transcription == "fuffa";

  shootSpear(enemy, hit);
}
