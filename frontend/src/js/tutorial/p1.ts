import "phaser";

import { TutorialStep } from "../tutorial_scene";
import Critter from "../critter";
import Spear from "../spear";
import Foe from "../foe";
import { FONTS } from "../assets";

export const STEPS: TutorialStep[] = [
  // {
  //   setup: (scene) => {
  //     const verb = scene.game.device.os.desktop ? "Click" : "Tap";
  //     const text = scene.createSimpleText(`Welcome! 👋🧔\n${verb} to start`);
  //     scene.bucket.push(text);
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: (scene) => {
  //     const text = scene.createSimpleText("That's Ötzi,\nthe Iceman\n❄️😎 🢆");
  //     scene.bucket.push(text);
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: (scene) => {
  //     const text = scene.createSimpleText(
  //       "Repented hunter,\nrushing to retire\n🛑🏹",
  //     );
  //     scene.bucket.push(text);
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: async (scene) => {
  //     const text = scene.createSimpleText(
  //       "That's a mob of\nangry bunnies\n🢇 🐰💢",
  //     );
  //     scene.bucket.push(text);
  //     scene.time.addEvent({
  //       delay: 500,
  //       repeat: 5,
  //       callback: () => {
  //         const critter = new Critter(
  //           scene,
  //           scene.player.getBounds().left / 3,
  //           0,
  //         );
  //         const collider = scene.physics.add.overlap(
  //           scene.player,
  //           critter,
  //           () => {
  //             if (navigator.vibrate) navigator.vibrate([60, 30, 120, 30, 180]);
  //             scene.sound.play("sfx_hit_player");
  //             scene.physics.world.removeCollider(collider);
  //             critter.escape();
  //             scene.player.hitFlash();
  //             scene.updateHealth(-7);
  //           },
  //         );
  //       },
  //     });
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: (scene) => {
  //     const text = scene.createSimpleText("😭💔 🢅\nHis health!\nThey hurt him");
  //     scene.bucket.push(text);
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: (scene) => {
  //     const text = scene.createSimpleText(
  //       "Ruthless bunnies!\nThey forget not.\n☠️☠️",
  //     );
  //     scene.bucket.push(text);
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: (scene) => {
  //     const text = scene.createSimpleText("However, as an\nex-hunter...\n🤔💡");
  //     scene.bucket.push(text);
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: async (scene) => {
  //     const text = scene.createSimpleText(
  //       "his (rubber) lances\nscare them away!\n🔫🤯",
  //     );
  //     scene.bucket.push(text);
  //     const bunnies = [];

  //     scene.time.addEvent({
  //       delay: 500,
  //       repeat: 5,
  //       callback: () => {
  //         const critter = new Critter(
  //           scene,
  //           scene.player.getBounds().left / 3,
  //           0,
  //         );
  //         bunnies.push(critter);
  //         const spear = new Spear(scene, scene.player, critter);
  //         const collider = scene.physics.add.overlap(spear, critter, () => {
  //           scene.sound.play("sfx_hi_beep");
  //           scene.updateScore(1);
  //         });
  //       },
  //     });
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: (scene) => {
  //     const text = scene.createSimpleText(
  //       "You can help him!\nHow? Typing along\n🤝⌨️",
  //     );
  //     scene.bucket.push(text);
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: (scene) => {
  //     const text = scene.createSimpleText(
  //       "Keep rhythm and poise,\none word for one spear\n🎶🎯",
  //     );
  //     scene.bucket.push(text);
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: (scene) => {
  //     const verb = scene.game.device.os.desktop ? "hit" : "tap";
  //     const text = scene.createText({
  //       text: `Try! Type your name\nthen ${verb} ENTER ↩🔨`,
  //       positionY: scene.uiDimensions.cluesBounds.centerY,
  //     });

  //     scene.bucket.push(text);
  //     scene.submitTranscription = (inputStatus) => {
  //       scene.userName = inputStatus.final;
  //       scene.nextStep();
  //       scene.submitTranscription = () => {};
  //     };
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: (scene) => {
  //     const text = scene.createText({
  //       text: `Nice job ${scene.userName}! 👑👍\nNow, the real thing...`,
  //       positionY: scene.uiDimensions.cluesBounds.centerY,
  //     });
  //     scene.bucket.push(text);
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: (scene) => {
  //     scene.submitTranscription = scene.fakeSubmitTranscription;
  //     const words = ["i", "am", scene.userName];
  //     const timerlo = scene.time.addEvent({
  //       delay: 100,
  //       startAt: -(500 + 4000 + 4000),
  //       repeat: -1,
  //       callback: () => {
  //         if (scene.foes.length > 0) return;
  //         scene.nextStep();
  //         timerlo.destroy();
  //       },
  //     });
  //     const timer = scene.time.addEvent({
  //       delay: 4000,
  //       startAt: 4000 - 500,
  //       repeat: words.length - 1,
  //       callback: () => {
  //         const index = timer.repeat - timer.repeatCount;
  //         const foe = new Foe(scene, 15);
  //         foe.initialize(
  //           1,
  //           {
  //             id: "",
  //             ocr_transcript: words[index],
  //           },
  //           {
  //             began_at_gmtm: scene.getGameTime(),
  //           },
  //         );
  //       },
  //     });
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: (scene) => {
  //     const text = scene.createText({
  //       text: "🡼 💪🏅\nGreat! You scored\na bunch of points",
  //       positionY: scene.uiDimensions.cluesBounds.centerY,
  //     });
  //     scene.bucket.push(text);
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: (scene) => {
  //     const text = scene.createText({
  //       text: "Speed and good\nCapiTaliZation\nare worth more",
  //       positionY: scene.uiDimensions.cluesBounds.centerY,
  //     });
  //     scene.bucket.push(text);
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: (scene) => {
  //     scene.submitTranscription = scene.fakeSubmitTranscription;
  //     const words = "no way you will catch all of these lol".split(" ");
  //     const timerlo = scene.time.addEvent({
  //       delay: 100,
  //       startAt: -1000,
  //       repeat: -1,
  //       callback: () => {
  //         if (scene.foes.length > 0) return;
  //         scene.nextStep();
  //         timerlo.destroy();
  //       },
  //     });
  //     const timer = scene.time.addEvent({
  //       delay: 500,
  //       repeat: words.length - 1,
  //       callback: () => {
  //         const index = timer.repeat - timer.repeatCount;
  //         const foe = new Foe(scene, 1);
  //         foe.initialize(
  //           1,
  //           {
  //             id: "",
  //             ocr_transcript: words[index],
  //           },
  //           {
  //             began_at_gmtm: scene.getGameTime(),
  //           },
  //         );
  //       },
  //     });
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: (scene) => {
  //     const text = scene.createText({
  //       text: "Words glow red when\nÖtzi is in danger\n🅰️⚠️",
  //       positionY: scene.uiDimensions.cluesBounds.centerY,
  //     });
  //     scene.bucket.push(text);
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // {
  //   setup: (scene) => {
  //     const text = scene.createText({
  //       text: "Longer words are worth\n(and will hurt) more\n🐘⚠️",
  //       positionY: scene.uiDimensions.cluesBounds.centerY,
  //     });
  //     scene.bucket.push(text);
  //   },
  //   teardown: (scene) => scene.emptyBucket(),
  // },
  // TODO: fraktur  a-z/pangrams
  {
    setup: (scene) => {
      const text = scene.add
        .text(
          scene.cameras.main.centerX,
          scene.cameras.main.centerY,
          "Aa Bb Cc Dd Ee Ff\nGg Hh Ii Jj Kk Ll\nMm Nn Oo Pp Qq Rr\nSs Tt Uu Vv Ww Xx\nYy Zz Ää Öö Üu ẞß",
          {
            fontFamily: FONTS.FRAK,
            // fontStyle: "bold",
            backgroundColor: "black",
            color: "white",
            stroke: "black",
            strokeThickness: 8,
            fontSize: `${Math.min(
              scene.cameras.main.width / 6 / 1.4,
              scene.cameras.main.height / 5 / 1.4,
            )}px`,
            align: "center",
          },
        )
        .setOrigin(0.5, 0.5);
      scene.bucket.push(text);
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
