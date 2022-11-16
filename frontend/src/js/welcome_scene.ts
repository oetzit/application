import "phaser";
import Game from "./game";
import TEXT_STYLES, { makeButtonHoverable } from "./text_styles";

export default class WelcomeScene extends Phaser.Scene {
  game!: Game;
  music!: Phaser.Sound.BaseSound;
  titleText!: Phaser.GameObjects.Text;
  helpButton!: Phaser.GameObjects.Text;
  playButton!: Phaser.GameObjects.Text;
  leadButton!: Phaser.GameObjects.Text;
  registerButton!: Phaser.GameObjects.Text;
  versionText!: Phaser.GameObjects.Text;

  constructor() {
    super("welcome");
  }

  async create(data: { music?: Phaser.Sound.BaseSound }) {
    if (data.music) {
      this.music = data.music;
    } else {
      this.music = this.sound.add("bkg_buildup", { loop: true });
      this.music.play();
    }

    this.createTitleText();

    this.helpButton = this.createMainButton("Tutorial");
    this.playButton = this.createMainButton("Play");
    this.leadButton = this.createMainButton("Leaderboard");
    this.registerButton = this.createMainButton("Register");

    this.playButton.setY(this.cameras.main.centerY);
    this.helpButton.setY(this.playButton.y - this.playButton.height);
    this.leadButton.setY(this.playButton.y + this.playButton.height);
    this.registerButton.setY(this.leadButton.y + this.leadButton.height);

    this.createVersionText();

    await this.game.initBeDevice();

    this.bindEvents();
  }

  createMainButton(text: string) {
    const button = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        text,
        TEXT_STYLES.BUTTON,
      )
      .setOrigin(0.5, 0);
    makeButtonHoverable(button);
    return button;
  }

  createTitleText() {
    const text = "ÖTZIT!";
    this.titleText = this.add
      .text(0, 0, text, TEXT_STYLES.TITLE)
      .setOrigin(0.5, 0)
      .setPosition(this.cameras.main.centerX, 32);
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
    this.registerButton.on("pointerup", this.startRegister.bind(this));
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

  startRegister() {
    this.scene.start("register", { music: this.music });
  }
}
