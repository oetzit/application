import "phaser";
import { FONTS } from "./assets";
import BackgroundScene from "./background_scene";
import { formatTime, ICONS, THIN_SPACE } from "./hud";

const BUTTON_HIGHLIGHT_COLOR = "darkorange";

const TEXT_STYLE: {
  [key: string]: Phaser.Types.GameObjects.Text.TextStyle;
} = {
  BUTTON: {
    fontFamily: FONTS.MONO,
    fontStyle: "bold",
    color: "white",
    stroke: "black",
    strokeThickness: 8,
    testString: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  },
};

export default class GameOverScene extends Phaser.Scene {
  music!: Phaser.Sound.BaseSound;
  continueButton!: Phaser.GameObjects.Text;

  constructor() {
    super("game_over");
  }

  preload() {}

  musicHardReplace(
    nextMusic: Phaser.Sound.BaseSound,
    prevMusic?: Phaser.Sound.BaseSound,
  ) {
    prevMusic?.stop();
    prevMusic?.destroy();
    this.music = nextMusic;
    this.music.play();
  }

  create(data: {
    music?: Phaser.Sound.BaseSound;
    words: number;
    score: number;
    time: number;
  }) {
    (this.scene.get("background") as BackgroundScene).dropCurtain();
    (this.scene.get("background") as BackgroundScene).atmosphere
      .stop()
      .restart();
    this.musicHardReplace(
      this.sound.add("bkg_failure", { loop: false }),
      data.music,
    );

    this.drawTitle();
    this.drawSubtitle(data.words);
    this.drawResult(data.score, data.time);
    this.drawCTA();
    this.bindEvents();
  }

  drawTitle() {
    const text = "GAME OVER";
    const title = this.add.text(0, 0, text, {
      fontSize: "48px",
      fontFamily: FONTS.MONO,
      fontStyle: "bold",
      color: "#ff0000",
    });
    title.setOrigin(0.5, 1);
    title.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.2,
    );
  }

  drawSubtitle(wordCount = 1234) {
    const text = `You donated to our research\n${wordCount} WORDS\n${ICONS.HEALTH}${THIN_SPACE}Thank you!${THIN_SPACE}${ICONS.HEALTH}`; //
    const subtitle = this.add.text(0, 0, text, {
      fontSize: "28px",
      fontFamily: FONTS.MONO,
      fontStyle: "bold",
      color: "#aaff00",
      align: "center",
      testString: text,
    });
    subtitle.setOrigin(0.5, 0);
    subtitle.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.2 + 16,
    );
  }

  drawResult(score = 12345678, time = 12 * 60 * 1000 + 34 * 1000 + 56 * 10) {
    const timer = formatTime(time);
    const text = `${score}\u2009${ICONS.SCORE}\n${timer}\u2009${ICONS.CLOCK}`;
    const title = this.add.text(0, 0, text, {
      fontSize: "28px",
      fontFamily: FONTS.MONO,
      fontStyle: "bold",
      color: "#ffffff",
      align: "right",
      testString: text,
    });
    title.setOrigin(0.5, 1);
    title.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.8 - 16,
    );
  }

  drawCTA() {
    const verb = this.game.device.os.desktop ? "Click" : "Tap";
    const text = `${verb} to continue`;
    this.continueButton = this.add
      .text(this.cameras.main.centerX, this.cameras.main.height * 0.8, text, {
        ...TEXT_STYLE.BUTTON,
        fontSize: "32px",
      })
      .setOrigin(0.5, 0)
      .setPadding(4)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () =>
        this.continueButton.setStyle({ stroke: BUTTON_HIGHLIGHT_COLOR }),
      )
      .on("pointerout", () =>
        this.continueButton.setStyle({ stroke: TEXT_STYLE.BUTTON.stroke }),
      );
  }

  bindEvents() {
    this.continueButton.on("pointerup", this.backToWelcome.bind(this));
  }

  backToWelcome() {
    (this.scene.get("background") as BackgroundScene).liftCurtain();
    this.scene.start("welcome", { music: this.music });
  }
}
