const ICONS = {
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
  inputPosition: number;
  inputFontSize: string;
}

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
      statsPadding: Math.min(this.scene.cameras.main.width * 0.01, 10), // min(1vw,10px)
      statsFontSize: "max(3vw,20px)", // never smaller than 20px
      inputPosition: 0.5,
      inputFontSize: "min(12vw,60px)", // always fit ~12 chars comfortably in width
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
        {
          ...INPUT_BASE_TEXT_STYLE,
          fontSize: this.options.inputFontSize,
        },
      )
      .setOrigin(0.5, 0.5);
  }

  statsTextStyle() {
    return {
      ...STATS_BASE_TEXT_STYLE,
      fontSize: this.options.statsFontSize,
    };
  }

  initScore(scene: Phaser.Scene) {
    return scene.add
      .text(
        this.options.statsPadding,
        this.options.statsPadding,
        "",
        this.statsTextStyle(),
      )
      .setOrigin(0, 0);
  }

  initHealth(scene: Phaser.Scene) {
    return scene.add
      .text(
        scene.cameras.main.width - this.options.statsPadding,
        this.options.statsPadding,
        "",
        this.statsTextStyle(),
      )
      .setOrigin(1, 0);
  }

  initClock(scene: Phaser.Scene) {
    return scene.add
      .text(
        scene.cameras.main.width * 0.5,
        this.options.statsPadding,
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
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    const hundredths = Math.floor((milliseconds % 1000) / 10)
      .toString()
      .padStart(2, "0");
    const formatted = `${minutes}:${seconds}.${hundredths}`;
    // TODO: we can probably do away with the clock icon
    this.clock.text = `${formatted}\u2009${ICONS.CLOCK}`;
  }

  showSubmitFeedback(color: string, input: string) {
    const text = this.scene.add
      .text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2,
        input,
        {
          ...INPUT_BASE_TEXT_STYLE,
          fontSize: this.options.inputFontSize,
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
}
