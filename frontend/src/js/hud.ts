export const ICONS = {
  SCORE: "️⭐️",
  CLOCK: "⏲️",
  HEALTH: "❤️️",
};

const STATS_BASE_TEXT_STYLE = {
  fontFamily: "Courier",
  fontStyle: "bold",
  color: "white",
  testString: `${ICONS.CLOCK}${ICONS.HEALTH}${ICONS.SCORE}1234567890:.`,
  stroke: "black",
  strokeThickness: 4,
} as Phaser.Types.GameObjects.Text.TextStyle;

const INPUT_BASE_TEXT_STYLE = {
  fontFamily: "Courier",
  fontStyle: "bold",
  color: "white",
  testString: `ABCDEFGHIJKLMNOPQRSTUVWXYZÄÜÖẞabcdefghijklmnopqrstuvwxyzäüöß `,
} as Phaser.Types.GameObjects.Text.TextStyle;

interface HudOptions {
  statsPadding: number;
  statsFontSize: string;
  inputPadding: number;
  inputFontSize: string;
  inputPosition: number;
}

export const formatTime = (milliseconds: number) => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  const hundredths = Math.floor((milliseconds % 1000) / 10)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}.${hundredths}`;
};

export default class HUD {
  scene: Phaser.Scene;
  options: HudOptions;
  input: Phaser.GameObjects.Text;
  score: Phaser.GameObjects.Text;
  clock: Phaser.GameObjects.Text;
  health: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, options?: HudOptions) {
    this.scene = scene;
    this.options = options || {
      statsPadding: 10,
      statsFontSize: "22px",
      inputPadding: 4,
      inputFontSize: "60px",
      inputPosition: 0.5,
    };
    this.input = this.initInput(scene);
    this.score = this.initScore(scene);
    this.health = this.initHealth(scene);
    this.clock = this.initClock(scene);
  }

  initInput(scene: Phaser.Scene) {
    return scene.add
      .text(
        scene.cameras.main.width / 2,
        scene.cameras.main.height * this.options.inputPosition,
        "",
        this.inputTextStyle(),
      )
      .setOrigin(0.5, 0.5);
  }

  inputTextStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      ...INPUT_BASE_TEXT_STYLE,
      fontSize: this.options.inputFontSize,
      padding: {
        x: this.options.inputPadding,
        y: this.options.inputPadding,
      },
    };
  }

  statsTextStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      ...STATS_BASE_TEXT_STYLE,
      fontSize: this.options.statsFontSize,
      padding: {
        x: this.options.statsPadding,
        y: this.options.statsPadding,
      },
    };
  }

  initScore(scene: Phaser.Scene) {
    return scene.add.text(0, 0, "", this.statsTextStyle()).setOrigin(0, 0);
  }

  initHealth(scene: Phaser.Scene) {
    return scene.add
      .text(scene.cameras.main.width, 0, "", this.statsTextStyle())
      .setOrigin(1, 0);
  }

  initClock(scene: Phaser.Scene) {
    return scene.add
      .text(
        scene.cameras.main.width * 0.5,
        0,
        `${ICONS.CLOCK}1:23.32`,
        this.statsTextStyle(),
      )
      .setOrigin(0.5, 0);
  }

  setInput(input: string) {
    this.input.text = input;
  }

  setScore(score: number) {
    this.score.text = `${ICONS.SCORE}\u2009${score}`;
  }

  setHealth(health: number) {
    this.health.text = `${health}\u2009${ICONS.HEALTH}`;
  }

  setClock(milliseconds: number) {
    this.clock.text = `${this.formatTime(milliseconds)}\u2009${ICONS.CLOCK}`;
  }

  showSubmitFeedback(color: string, input: string) {
    const text = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height * this.options.inputPosition,
        input,
        {
          ...this.inputTextStyle(),
          color: color,
        },
      )
      .setOrigin(0.5, 0.5);
    this.scene.tweens.add({
      targets: text,
      scaleX: 5,
      scaleY: 5,
      alpha: 0,
      ease: "Power2",
      duration: 500,
      onComplete: (_tween, [target]) => target.destroy(),
    });
  }

  announceWave(input: string) {
    const text = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 4,
        input,
        {
          ...this.inputTextStyle(),
          color: "white",
        },
      )
      .setOrigin(0.5, 0.5)
      .setAlpha(0)
      .setScale(0);
    this.scene.tweens.add({
      targets: text,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      ease: "Expo",
      yoyo: true,
      duration: 500,
    });
  }

  changeFlash(object: Phaser.GameObjects.Text, color: number) {
    object.setTintFill(color);
    this.scene.time.delayedCall(100, () => object.clearTint());
  }
}
