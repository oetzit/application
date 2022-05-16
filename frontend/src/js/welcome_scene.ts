import "phaser";
import { FONTS } from "./assets";

const BUTTON_HIGHLIGHT_COLOR = "darkorange";

const TEXT_STYLE: {
  [key: string]: Phaser.Types.GameObjects.Text.TextStyle;
} = {
  TITLE: {
    fontFamily: FONTS.MONO,
    fontStyle: "bold",
    color: "white",
    stroke: "black",
    strokeThickness: 8,
  },
  BUTTON: {
    fontFamily: FONTS.MONO,
    fontStyle: "bold",
    color: "white",
    stroke: "black",
    strokeThickness: 8,
    testString: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  },
  VERSION: {
    fontFamily: FONTS.MONO,
    fontSize: "16px",
    fontStyle: "bold",
    color: "#888888",
    testString: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.",
  },
};

export default class WelcomeScene extends Phaser.Scene {
  music!: Phaser.Sound.BaseSound;
  titleText!: Phaser.GameObjects.Text;
  helpButton!: Phaser.GameObjects.Text;
  playButton!: Phaser.GameObjects.Text;
  leadButton!: Phaser.GameObjects.Text;
  versionText!: Phaser.GameObjects.Text;

  constructor() {
    super("welcome");
  }

  musicHardReplace(
    nextMusic: Phaser.Sound.BaseSound,
    prevMusic?: Phaser.Sound.BaseSound,
  ) {
    prevMusic?.stop();
    prevMusic?.destroy();
    this.music = nextMusic;
    this.music.play();
  }

  create(data: { music?: Phaser.Sound.BaseSound }) {
    this.musicHardReplace(
      this.sound.add("bkg_buildup", { loop: true }),
      data.music,
    );

    this.createTitleText();
    this.helpButton = this.createMainButton("Tutorial", 0);
    this.playButton = this.createMainButton("Play", 1);
    this.leadButton = this.createMainButton("Leaderboard", 2);
    this.createVersionText();

    this.bindEvents();
  }

  createMainButton(text: string, index: number) {
    const size = Math.min(this.cameras.main.width * 0.125, 48);
    const button = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + index * size * 1.4,
        text,
        {
          ...TEXT_STYLE.BUTTON,
          fontSize: `${size}px`,
        },
      )
      .setOrigin(0.5, 0.5)
      .setPadding(4)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () =>
        button.setStyle({ stroke: BUTTON_HIGHLIGHT_COLOR }),
      )
      .on("pointerout", () =>
        button.setStyle({ stroke: TEXT_STYLE.BUTTON.stroke }),
      );
    return button;
  }

  createTitleText() {
    const text = "ÖTZIT!";
    this.titleText = this.add
      .text(0, 0, text, {
        ...TEXT_STYLE.TITLE,
        fontSize: `${Math.min(this.cameras.main.width * 0.125, 128)}px`,
        testString: text,
      })
      .setOrigin(0.5, 1)
      .setPosition(this.cameras.main.centerX, this.cameras.main.height * 0.3);
  }

  createVersionText() {
    const text = process.env.APP_VERSION || "unknown";
    this.versionText = this.add
      .text(0, 0, text.toUpperCase(), TEXT_STYLE.VERSION)
      .setOrigin(0.5, 1)
      .setPadding(8)
      .setPosition(this.cameras.main.centerX, this.cameras.main.height);
  }

  bindEvents() {
    this.helpButton.on("pointerup", this.startTutorial.bind(this));
    this.playButton.on("pointerup", this.startFight.bind(this));
    this.leadButton.on("pointerup", this.startLeaderboard.bind(this));
  }

  startTutorial() {
    this.scene.start("tutorial", { music: this.music });
  }

  startFight() {
    this.scene.start("fight", { music: this.music });
  }

  startLeaderboard() {
    this.scene.start("leaderboard", { music: this.music });
  }
}
