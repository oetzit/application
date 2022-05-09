import "phaser";

import { FONTS } from "./assets";
import MainScene from "./main_scene";

import { STEPS as P1_STEPS } from "./tutorial/p1";

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
  setup: (scenescene: TutorialScene) => void;
  teardown: (scene: TutorialScene) => void;
}

export default class TutorialScene extends MainScene {
  currentStep!: number;
  bucket: Phaser.GameObjects.GameObject[] = [];
  steps: TutorialStep[];

  constructor() {
    super("tutorial");
    this.steps = P1_STEPS;
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

  createText(options: {
    text: string;
    positionX?: number;
    positionY?: number;
    originX?: number;
    originY?: number;
  }) {
    const text = this.add
      .text(options.positionX || 0, options.positionY || 0, options.text, {
        ...TEXT_STYLE.TUTORIAL,
        fontSize: `${Math.min(this.cameras.main.width * 0.125, 32)}px`,
        align: "center",
      })
      .setOrigin(options.originX, options.originY)
      .setPadding(16)
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
}
