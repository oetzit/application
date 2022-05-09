import "phaser";

import { TutorialStep } from "../tutorial_scene";
import Critter from "../critter";
import Spear from "../spear";

export const STEPS: TutorialStep[] = [
  {
    setup: (scene) => {
      const verb = scene.game.device.os.desktop ? "Click" : "Tap";
      const text = scene.createText({
        text: `Hi! 🧔\n${verb} me`,
        positionX: scene.cameras.main.centerX,
        positionY: scene.cameras.main.centerY,
      });
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const text = scene.createText({
        text: "That's Ötzi\nthe Iceman\n🢆",
        positionX: scene.cameras.main.centerX,
        positionY: scene.cameras.main.centerY,
      });
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: async (scene) => {
      const text = scene.createText({
        text: "That's a mob of\nangry bunnies\n🢇",
        positionX: scene.cameras.main.centerX,
        positionY: scene.cameras.main.centerY,
      });
      scene.bucket.push(text);
      scene.time.addEvent({
        delay: 500,
        repeat: 3,
        callback: () => {
          const critter = new Critter(
            scene,
            scene.player.getBounds().left / 3,
            0,
          );
          const collider = scene.physics.add.overlap(
            scene.player,
            critter,
            () => {
              if (navigator.vibrate) navigator.vibrate([60, 30, 120, 30, 180]);
              scene.sound.play("sfx_hit_player");
              scene.physics.world.removeCollider(collider);
              critter.escape();
              scene.player.hitFlash();
              scene.updateHealth(-7);
            },
          );
        },
      });
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const text = scene.createText({
        text: "🢅\nHis health!\nThey hurt him.",
        positionX: scene.cameras.main.centerX,
        positionY: scene.cameras.main.centerY,
      });
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const text = scene.createText({
        text: "But he's an hunter...",
        positionX: scene.cameras.main.centerX,
        positionY: scene.cameras.main.centerY,
      });
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: async (scene) => {
      const text = scene.createText({
        text: "His (rubber) lances can\n scare away the animals!",
        positionX: scene.cameras.main.centerX,
        positionY: scene.cameras.main.centerY,
      });
      scene.bucket.push(text);
      const bunnies = [];

      scene.time.addEvent({
        delay: 500,
        repeat: 3,
        callback: () => {
          const critter = new Critter(
            scene,
            scene.player.getBounds().left / 3,
            0,
          );
          bunnies.push(critter);
          const spear = new Spear(scene, scene.player, critter);
          const collider = scene.physics.add.overlap(spear, critter, () => {
            scene.sound.play("sfx_hi_beep");
            scene.updateScore(1);
          });
        },
      });
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => scene.scene.start("welcome", { music: scene.music }),
    teardown: () => {
      return;
    },
  },
];
