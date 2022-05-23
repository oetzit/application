import "phaser";
import TEXT_STYLES, { makeButtonHoverable } from "./text_styles";

export default class WelcomeScene extends Phaser.Scene {
  music!: Phaser.Sound.BaseSound;
  titleText!: Phaser.GameObjects.Text;
  helpButton!: Phaser.GameObjects.Text;
  playButton!: Phaser.GameObjects.Text;
  leadButton!: Phaser.GameObjects.Text;
  rewardsButton!: Phaser.GameObjects.Text;
  versionText!: Phaser.GameObjects.Text;

  constructor() {
    super("welcome");
  }

  create(data: { music?: Phaser.Sound.BaseSound }) {
    if (data.music) {
      this.music = data.music;
    } else {
      this.music = this.sound.add("bkg_buildup", { loop: true });
      this.music.play();
    }

    this.createTitleText();
    this.helpButton = this.createMainButton("Tutorial", 0);
    this.playButton = this.createMainButton("Play", 1);
    this.leadButton = this.createMainButton("Leaderboard", 2);
    this.rewardsButton = this.createMainButton("Rewards", 3);
    this.createVersionText();

    this.bindEvents();
  }

  createMainButton(text: string, index: number) {
    const fontSize = Math.min((this.cameras.main.height * 0.5) / 4 / 1.4, 48);
    const button = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + index * fontSize * 1.4,
        text,
        TEXT_STYLES.BUTTON,
      )
      .setFontSize(fontSize)
      .setOrigin(0.5, 1);
    makeButtonHoverable(button);
    return button;
  }

  createTitleText() {
    const text = "ÖTZIT!";
    const fontSize = Math.min(this.cameras.main.height * 0.25, 128);
    this.titleText = this.add
      .text(0, 0, text, {
        ...TEXT_STYLES.BASE,
        testString: text,
      })
      .setFontSize(fontSize)
      .setOrigin(0.5, 1)
      .setPosition(this.cameras.main.centerX, this.cameras.main.height * 0.3);
  }

  createVersionText() {
    const text = process.env.APP_VERSION || "unknown";
    this.versionText = this.add
      .text(0, 0, text.toUpperCase(), TEXT_STYLES.VERSION_TAG)
      .setOrigin(0.5, 1)
      .setPosition(this.cameras.main.centerX, this.cameras.main.height);
  }

  bindEvents() {
    this.helpButton.on("pointerup", this.startTutorial.bind(this));
    this.playButton.on("pointerup", this.startFight.bind(this));
    this.leadButton.on("pointerup", this.startLeaderboard.bind(this));
    this.rewardsButton.on("pointerup", this.startRewards.bind(this));
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

  startRewards() {
    this.scene.start("rewards", { music: this.music });
  }
}
