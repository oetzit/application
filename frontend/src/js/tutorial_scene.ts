import "phaser";

import { FONTS } from "./assets";
import MainScene, { InputStatus } from "./main_scene";
import Spear from "./spear";

import { STEPS } from "./tutorial_steps";
import { nthFibonacci } from "./utils";

const BUTTON_HIGHLIGHT_COLOR = "darkorange";

const TEXT_STYLE: {
  [key: string]: Phaser.Types.GameObjects.Text.TextStyle;
} = {
  TUTORIAL: {
    fontFamily: FONTS.MONO,
    fontStyle: "bold",
    color: "white",
    stroke: "black",
    strokeThickness: 8,
  },
};

export interface TutorialStep {
  setup: (scene: TutorialScene) => void;
  teardown: (scene: TutorialScene) => void;
}

interface CreateTextOptions {
  text: string;
  positionX?: number;
  positionY?: number;
  originX?: number;
  originY?: number;
  interactive?: boolean;
}

export default class TutorialScene extends MainScene {
  tapoutEnabled = false;
  typewriterEnabled = false;

  currentStep!: number;
  bucket: Phaser.GameObjects.GameObject[] = [];
  steps: TutorialStep[];
  userName = "";

  constructor() {
    super("tutorial");
    this.steps = STEPS;
  }

  async beforeGameStart() {
    this.currentStep = -1;
    this.nextStep();
  }

  nextStep() {
    this.currentStep += 1;
    if (this.currentStep > 0) this.steps[this.currentStep - 1].teardown(this);
    if (this.currentStep < this.steps.length)
      this.steps[this.currentStep].setup(this);
  }

  emptyBucket() {
    while (this.bucket.length) {
      this.bucket.pop()!.destroy();
    }
  }

  createSimpleText(text: string) {
    return this.createText({ text });
  }

  createText(options: CreateTextOptions) {
    const text = this.add
      .text(
        options.positionX ?? this.cameras.main.centerX,
        options.positionY ?? this.cameras.main.centerY,
        options.text,
        {
          ...TEXT_STYLE.TUTORIAL,
          fontSize: `${Math.min(this.cameras.main.width * 0.125, 32)}px`,
          align: "center",
        },
      )
      .setOrigin(options.originX ?? 0.5, options.originY ?? 0.5)
      .setPadding(16);

    if (options.interactive ?? true)
      text
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () =>
          text.setStyle({ stroke: BUTTON_HIGHLIGHT_COLOR }),
        )
        .on("pointerout", () =>
          text.setStyle({ stroke: TEXT_STYLE.TUTORIAL.stroke }),
        )
        .on("pointerup", () => this.nextStep());
    return text;
  }

  trialSubmitTranscription = (inputStatus: InputStatus) => {
    const similarityThreshold = 0.9;
    // NOTE: this ain't async to avoid any UX delay
    const { similarity, match } = this.findMatchingFoe(inputStatus.final);

    let score = 0;
    if (match === null) {
      score = 0;
    } else if (similarity < similarityThreshold) {
      score = -1;
    } else {
      const lengthScore = nthFibonacci(1 + match.beWord.ocr_transcript.length);
      const accuracyBonus = similarity;
      const speedBonus =
        2 -
        (inputStatus.ended_at_gmtm - match.beClue.began_at_gmtm) /
          (match.duration * 1000);
      score = Math.round(lengthScore * accuracyBonus * speedBonus);
    }

    // backend.createShot(this.beGame.id, {
    //   clue_id: match?.beClue?.id || null,
    //   similarity: similarity,
    //   score: score,
    //   ...inputStatus,
    // });

    if (match === null) {
      // NOOP
      this.sound.play("sfx_md_beep");
      this.hud.showSubmitFeedback("white", inputStatus.final);
    } else if (similarity < similarityThreshold) {
      // TODO: visual near misses based on score
      this.sound.play("sfx_lo_beep");
      this.updateScore(score);
      match.handleFailure();
      this.hud.showSubmitFeedback("red", inputStatus.final);
      new Spear(this, this.player, undefined);
    } else {
      this.acceptedWords += 1;
      this.sound.play("sfx_hi_beep");
      // backend.updateClue(match.beClue.id, {
      //   ended_at: new Date().toISOString(),
      //   ended_at_gmtm: this.getGameTime(),
      // });
      this.updateScore(score);
      this.popFoe(match);
      match.handleSuccess();
      this.hud.showSubmitFeedback("green", inputStatus.final);
      new Spear(this, this.player, match.critter);
    }
  };
}
