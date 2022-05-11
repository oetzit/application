import "phaser";

import TutorialScene, { TutorialStep } from "./tutorial_scene";
import Critter from "./critter";
import Spear from "./spear";
import Foe from "./foe";
import { FONTS } from "./assets";
import { TextCluePayload, TEXT_STYLE } from "./clue_payloads";

interface TrialRoundOptions {
  scene: TutorialScene;
  words: string[];
  initialDelay: number;
  wordsDelay: number;
  fixedDuration?: number;
}

function trialRound({
  scene,
  words,
  initialDelay,
  wordsDelay,
  fixedDuration,
}: TrialRoundOptions) {
  scene.updateHealth(100 - scene.health);
  scene.acceptedWords = 0;
  scene.submitTranscription = scene.trialSubmitTranscription;
  const completionWatcher = scene.time.addEvent({
    delay: 100, // i.e. the polling rate
    startAt: -(words.length - 1) * wordsDelay - initialDelay,
    repeat: -1,
    callback: () => {
      if (scene.foes.length > 0) return;
      scene.submitTranscription = () => {};
      scene.nextStep();
      completionWatcher.destroy();
    },
  });
  const timer = scene.time.addEvent({
    delay: wordsDelay,
    startAt: wordsDelay - initialDelay,
    repeat: words.length - 1,
    callback: () => {
      const index = timer.repeat - timer.repeatCount;
      const word = words[index];
      const foe = new Foe(
        scene,
        fixedDuration === undefined ? word.length * 2 : fixedDuration / 1000,
      );
      foe.initialize(
        1,
        {
          id: "",
          ocr_transcript: word,
        },
        {
          began_at_gmtm: scene.getGameTime(),
        },
      );
    },
  });
}

export const STEPS: TutorialStep[] = [
  {
    setup: (scene) => {
      const verb = scene.game.device.os.desktop ? "Click" : "Tap";
      const text = scene.createSimpleText(`Welcome! 👋🧔\n${verb} to start`);
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const text = scene.createSimpleText("That's Ötzi,\nthe Iceman\n❄️😎 🢆");
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const text = scene.createSimpleText(
        "Repented hunter,\nrushing to retire\n🛑🏹",
      );
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: async (scene) => {
      const text = scene.createSimpleText(
        "That's a mob of\nangry bunnies\n🢇 🐰💢",
      );
      scene.bucket.push(text);

      scene.time.addEvent({
        delay: 500,
        repeat: 5,
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
              scene.updateHealth(-1);
            },
          );
        },
      });
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const text = scene.createSimpleText("😭💔 🢅\nHis health!\nThey hurt him");
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const text = scene.createSimpleText(
        "Ruthless bunnies!\nThey forget not.\n☠️☠️",
      );
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const text = scene.createSimpleText("However, as an\nex-hunter...\n🤔💡");
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: async (scene) => {
      const text = scene.createSimpleText(
        "his (rubber) lances\nscare them away!\n🔫🤯",
      );
      scene.bucket.push(text);

      scene.time.addEvent({
        delay: 500,
        repeat: 5,
        callback: () => {
          const critter = new Critter(
            scene,
            scene.player.getBounds().left / 3,
            0,
          );
          const spear = new Spear(scene, scene.player, critter);
          const collider = scene.physics.add.overlap(spear, critter, () => {
            scene.physics.world.removeCollider(collider);
            scene.sound.play("sfx_hi_beep");
            scene.updateScore(1);
          });
        },
      });
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const text = scene.createSimpleText(
        "You can help him!\nHow? Typing along\n🤝⌨️",
      );
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const text = scene.createSimpleText(
        "Keep rhythm and poise,\none word for one spear\n🎶🎯",
      );
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      scene.setTypewriterEnabled(true);
      const verb = scene.game.device.os.desktop ? "hit" : "tap";
      const text = scene.createText({
        text: `Try! Type your name\nthen ${verb} ENTER ↩🔨`,
        positionY: scene.uiDimensions.cluesBounds.centerY,
        interactive: false,
      });
      scene.bucket.push(text);

      scene.submitTranscription = (inputStatus) => {
        scene.userName = inputStatus.final;
        scene.nextStep();
        scene.submitTranscription = () => {};
      };
    },
    teardown: (scene) => {
      scene.emptyBucket();
      scene.setTypewriterEnabled(false);
      scene.typewriter.resetInputStatus();
      scene.hud.setInput("");
    },
  },
  {
    setup: (scene) => {
      const text = scene.createText({
        text: `Nice job ${scene.userName}! 👑👍\nNow, the real thing...`,
        positionY: scene.uiDimensions.cluesBounds.centerY,
      });
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      scene.setTypewriterEnabled(true);
      TextCluePayload.prototype.textStyle = TEXT_STYLE.MONO_NEWSPAPER;
      trialRound({
        scene: scene,
        words: ["i", "am", scene.userName],
        initialDelay: 500,
        wordsDelay: 4000,
        fixedDuration: 4000,
      });
    },
    teardown: (scene) => {
      scene.emptyBucket();
      scene.setTypewriterEnabled(false);
      scene.typewriter.resetInputStatus();
      scene.hud.setInput("");
    },
  },
  {
    setup: (scene) => {
      const text = scene.createText({
        text: `🡼 💪🏅\nGreat! You scored\n${scene.score} points`,
        positionY: scene.uiDimensions.cluesBounds.centerY,
      });
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const text = scene.createText({
        text: "Speed and good\nCapiTaliZation\nare worth more",
        positionY: scene.uiDimensions.cluesBounds.centerY,
      });
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      scene.setTypewriterEnabled(true);
      TextCluePayload.prototype.textStyle = TEXT_STYLE.MONO_NEWSPAPER;
      trialRound({
        scene: scene,
        words: "no way you will catch all of these lol".split(" "),
        initialDelay: 500,
        wordsDelay: 500,
        fixedDuration: 1000,
      });
    },
    teardown: (scene) => {
      scene.emptyBucket();
      scene.setTypewriterEnabled(false);
      scene.typewriter.resetInputStatus();
      scene.hud.setInput("");
    },
  },
  {
    setup: (scene) => {
      const text = scene.createText({
        text: "Words glow red when\nÖtzi is in danger\n🅰️⚠️",
        positionY: scene.uiDimensions.cluesBounds.centerY,
      });
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const text = scene.createText({
        text: "Longer words are worth\n(and will hurt) more\n🐘⚠️",
        positionY: scene.uiDimensions.cluesBounds.centerY,
      });
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const text = scene.createText({
        text: "⏲️ 🢁 ⚠️\nAlso, as time passes,\nthings will get harder",
        positionY: scene.uiDimensions.cluesBounds.centerY,
      });
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const text = scene.createText({
        text: "By the way, we'll\nuse Fraktur script!\n😖❓",
        positionY: scene.uiDimensions.cluesBounds.centerY,
      });
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const onPointerUp = () => {
        scene.nextStep();
        scene.input.off("pointerup", onPointerUp);
      };
      scene.input.on("pointerup", onPointerUp);

      const backdrop = scene.add
        .rectangle(
          0,
          0,
          scene.cameras.main.width,
          scene.cameras.main.height,
          0x000000,
          0.6,
        )
        .setOrigin(0, 0);

      scene.bucket.push(backdrop);

      const px = scene.cameras.main.width / 40;
      const py = scene.cameras.main.height / 40;
      const p = Math.round(Math.min(px, py));

      const c = 6;
      const r = 5;

      const w = (scene.cameras.main.width - p * (c + 1)) / c;
      const h = (scene.cameras.main.height - p * (r + 1)) / r;

      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜẞ";

      Array.from(alphabet).forEach((letter, index) => {
        const i = index % c;
        const j = Math.floor(index / c);
        const text = scene.add
          .text(
            (p + w) * i + p + w * 0.5,
            (p + h) * j + p + h * 0.5,
            letter + letter.toLocaleLowerCase(),
            {
              fontFamily: FONTS.FRAK,
              fontSize: `${h / 1.4}px`,
              testString: alphabet + alphabet.toLowerCase(),
              color: "#ffffff",
              stroke: "black",
              strokeThickness: 4,
            },
          )
          .setOrigin(0.5, 0.5);
        scene.bucket.push(text);
      });
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const text = scene.createText({
        text: "Yup, that's a handful.\nBrace yourself...\n😅😱",
        positionY: scene.uiDimensions.cluesBounds.centerY,
      });
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const verb = scene.game.device.os.desktop ? "hit ESC" : "tap twice";
      const text = scene.createText({
        text: `Oh! And remember:\n${verb} to pause\n🙏⏸️`,
        positionY: scene.uiDimensions.cluesBounds.centerY,
      });
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      scene.setTypewriterEnabled(true);
      scene.tapoutEnabled = true;
      TextCluePayload.prototype.textStyle = TEXT_STYLE.FRAK_NEWSPAPER;
      trialRound({
        scene: scene,
        words: "Üben von Xylophon und Querflöte ist ja zweckmäßig".split(" "),
        initialDelay: 500,
        wordsDelay: 5000,
      });
    },
    teardown: (scene) => {
      scene.emptyBucket();
      scene.tapoutEnabled = false;
      scene.setTypewriterEnabled(false);
      scene.typewriter.resetInputStatus();
      scene.hud.setInput("");
    },
  },
  {
    setup: (scene) => {
      const comment = [
        "A fair start!\n🙄🥉", // 0 1 2
        "Pretty good!\n😊🥈", // 3 4 5
        "Very impressive!\n🤩🥇", // 6 7 8
      ][Math.floor((3 * scene.acceptedWords) / (8 + 1))];
      const text = scene.createText({
        text: `You got ${scene.acceptedWords} out of 8.\n${comment}`,
        positionY: scene.uiDimensions.cluesBounds.centerY,
      });
      scene.bucket.push(text);
    },
    teardown: (scene) => scene.emptyBucket(),
  },
  {
    setup: (scene) => {
      const text = scene.createText({
        text: `That's it, ${scene.userName}.\nTime to play!\n😋🕹️`,
        positionY: scene.uiDimensions.cluesBounds.centerY,
      });
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
