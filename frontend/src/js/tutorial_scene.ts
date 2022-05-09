import "phaser";
import { FONTS } from "./assets";

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

import MainScene from "./main_scene";

export default class TutorialScene extends MainScene {
  currentStep!: number;
  bucket: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super("tutorial");
  }

  steps = [
    {
      setup: () => {
        const text = this.createText({
          text: "Hi! 🧔\n Tap me.️",
          positionX: this.cameras.main.centerX,
          positionY: this.cameras.main.centerY,
        });
        this.bucket.push(text);
      },
      teardown: this.emptyBucket.bind(this),
    },
    {
      setup: () => {
        const text = this.createText({
          text: "Good! 🥇\nYou're done.",
          positionX: this.cameras.main.centerX,
          positionY: this.cameras.main.centerY,
        });
        this.bucket.push(text);
      },
      teardown: this.emptyBucket.bind(this),
    },
    {
      setup: () => this.scene.start("welcome", { music: this.music }),
      teardown: () => {},
    },
  ];

  async beforeGameStart() {
    this.currentStep = -1;
    this.nextStep();
  }

  nextStep() {
    this.currentStep += 1;
    if (this.currentStep > 0) this.steps[this.currentStep - 1].teardown();
    if (this.currentStep < this.steps.length)
      this.steps[this.currentStep].setup();
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
        fontSize: `${Math.min(this.cameras.main.width * 0.125, 48)}px`,
        align: "center",
      })
      .setOrigin(options.originX, options.originY)
      .setPadding(16)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () =>
        text.setStyle({ stroke: BUTTON_HIGHLIGHT_COLOR }),
      )
      .on("pointerout", () =>
        text.setStyle({ stroke: TEXT_STYLE.BUTTON.stroke }),
      )
      .on("pointerup", () => this.nextStep());
    return text;
  }
}
