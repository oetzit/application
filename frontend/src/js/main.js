import * as Phaser from "phaser";
import axios from "axios";
import "jquery";
import "popper.js";
import "bootstrap";
import * as bootbox from "bootbox";
import "../css/override.css";

let config = {
  type: Phaser.AUTO,
  pixelArt: true,

  backgroundColor: "#000",
  scale: {
    parent: "gioco",
    mode: Phaser.Scale.SHOW_ALL,
  },
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
  this.load.image("fadeBG", "assets/background_layers/fadeBG.png");

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

// window.OetziWordsSiteUrlPrefix = "http://localhost:8080/oetzi_words/" //use this to develop
window.OetziWordsSiteUrlPrefix = "http://localhost:8080/"; // use this to deploy

let gameRunning = false;
let player;
let scene;
let foreBG;
let fadeBG;
let imageInUse = [];
let enemyNumber = 0;
let ground;
let consecutiveMissing = 0;

/* game params */
let enemies = ["bear", "wolf", "deer", "boar"];
let maxEnemyNumber = 4;
let enemiesSpeed = 50000;
/**************/

function create() {
  scene = this;
  for (let i = 0; i <= 10; i++) {
    this.add
      .tileSprite(
        0,
        0,
        this.cameras.main.width,
        this.cameras.main.height,
        "b" + i,
      )
      .setOrigin(0)
      .setScrollFactor(0);
  }
  this.add.image(this.cameras.main.width / 2, 100, "logo").setScale(0.3);

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

  foreBG = this.add
    .tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, "b11")
    .setOrigin(0, 0);
  fadeBG = this.add
    .tileSprite(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      "fadeBG",
    )
    .setOrigin(0)
    .setScrollFactor(0)
    .setInteractive();
  fadeBG.setVisible(false);

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
      gameStart();
    },
  });

  this.scale.displaySize.setAspectRatio(
    this.cameras.main.width / this.cameras.main.height,
  );
  this.scale.refresh();
}

function createAnim(key, refKey, from, to) {
  scene.anims.create({
    key: key,
    frames: scene.anims.generateFrameNumbers(refKey, { start: from, end: to }),
    frameRate: 10,
    repeat: -1,
  });
}

function gameStart() {
  let waitTime = 200;
  for (let i = 0; i < maxEnemyNumber; i++) {
    setTimeout(() => {
      dispatchEnemy();
    }, waitTime);
    waitTime += Math.floor(Math.random() * 4000 + 4000);
  }
}

function dispatchEnemy() {
  let e = new enemy();

  axios
    .post(window.OetziWordsSiteUrlPrefix + "GetImage", {
      sessionImages: imageInUse,
    })
    .then(function (response) {
      e.refData = response.data;
      imageInUse.push(e.refData.id);

      e.run((v) => {
        imageInUse.splice(imageInUse.indexOf(e.refData.id), 1);
        if (gameRunning) {
          setTimeout(() => {
            dispatchEnemy();
          }, Math.floor(Math.random() * 10000 + 3000));
        }
      });
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

    let enemy = scene.physics.add
      .sprite(-100, scene.cameras.main.height - 100, randomEnemyType)
      .setScale(scale)
      .setInteractive();
    enemy.typeName = randomEnemyType;
    scene.physics.add.collider(enemy, ground);
    enemy.flipX = true;

    setAnimation(enemy, enemy.typeName + "_walk");
    scene.children.bringToTop(foreBG);
    scene.children.bringToTop(fadeBG);

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

    enemy.on("pointerdown", function (pointer) {
      let hit = true;
      enemy.disableInteractive();
      // here invoke image
      enemy.movement.pause();
      setAnimation(enemy, enemy.typeName + "_idle");
      fadeBG.setVisible(true);

      let beginTime = new Date().getTime();

      console.log(me.refData.image);

      bootbox.prompt({
        // title: "<p>Please write the transcription in the box below:</p>", message: "<p><img style='max-width: 470px' src='" + window.OetziWordsSiteUrlPrefix + 'images/' + me.refData.filename + "'/></p>", centerVertical: true, closeButton: false, buttons: {
        title: "<p>Please write the transcription in the box below:</p>",
        message:
          "<p><img style='max-width: 470px' src='data:image/png;base64, " +
          me.refData.image +
          "'/></p>",
        centerVertical: true,
        closeButton: false,
        buttons: {
          confirm: {
            label: "Confirm",
          },
        },
        callback: function (result) {
          let endTime = new Date().getTime();
          let deltaTime = endTime - beginTime;
          fadeBG.setVisible(false);

          if (result.trim().length === 0) {
            hit = false;
          }

          axios
            .post(window.OetziWordsSiteUrlPrefix + "CheckTranscription", {
              refData: me.refData,
              transcription: result,
              deltaTime: deltaTime,
            })
            .then(function (response) {
              // console.log(response.data);

              hit = response.data.hitTheTarget;
              if (consecutiveMissing >= 3 && deltaTime >= 3000) {
                consecutiveMissing = 0;
                hit = true;
              }
              if (hit) {
                consecutiveMissing = 0;
              } else {
                consecutiveMissing++;
              }

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
                .sprite(
                  scene.cameras.main.width / 2,
                  scene.cameras.main.height / 2,
                )
                .setScale(1);

              // hit / missing <--- message
              if (!hit) {
                endPoint = new Phaser.Math.Vector2(
                  -500,
                  scene.cameras.main.height - 60,
                );
                message.play({ key: "missing", repeat: 1 });
                message.on("animationcomplete", () => {
                  message.anims.remove("miss");
                  message.destroy();
                });
              } else {
                let message = scene.add
                  .sprite(
                    scene.cameras.main.width / 2,
                    scene.cameras.main.height / 2,
                  )
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
                          callback(me);
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
              //console.log(enemy.typeName);
            });
        }, //callback bootbox
      });
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
