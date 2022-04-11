import "phaser";

export default class GameOverScene extends Phaser.Scene {
  music!: Phaser.Sound.BaseSound;

  constructor() {
    super("game_over");
  }

  preload() {
    this.load.audio("bkg_failure", "assets/music/loose.wav");
    this.load.audio("bkg_success", "assets/music/win.wav");
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
      this.sound.add("bkg_failure", { loop: false }),
      data.music,
    );

    this.drawTitle();
    this.drawCTA();
    this.bindEvents();
  }

  drawTitle() {
    const text = "ÖTZI\nDIED";
    const title = this.add.text(0, 0, text, {
      font: "bold 64px Courier",
      color: "#ff0000",
    });
    title.setOrigin(0.5, 0.5);
    title.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.4,
    );
  }

  drawCTA() {
    const text = "press to continue";
    const cta = this.add.text(0, 0, text, {
      font: "bold 32px Courier",
      color: "#ffffff",
    });
    cta.setOrigin(0.5, 0.5);
    cta.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.7,
    );
  }

  bindEvents() {
    this.input.keyboard.once("keyup", this.startFight.bind(this));
    this.input.once("pointerup", this.startFight.bind(this));
  }

  startFight() {
    this.scene.start("welcome", { music: this.music });
  }
}
