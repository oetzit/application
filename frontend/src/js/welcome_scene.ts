import "phaser";

export default class WelcomeScene extends Phaser.Scene {
  music!: Phaser.Sound.BaseSound;

  constructor() {
    super("welcome");
  }

  preload() {
    this.load.audio("bkg_buildup", "assets/music/buildup.wav");
    this.load.audio("bkg_breakdown", "assets/music/breakdown.wav");
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

    this.drawTitle();
    this.drawCTA();
    this.drawVersion();
    this.bindEvents();
  }

  drawTitle() {
    const text = "ÖTZI\nGAME";
    const title = this.add.text(0, 0, text, {
      fontFamily: "Courier",
      fontSize: "64px",
      fontStyle: "bold",
      color: "white",
      stroke: "black",
      strokeThickness: 4,
      testString: text,
    });
    title.setOrigin(0.5, 1);
    title.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.475,
    );
  }

  drawCTA() {
    const text = this.game.device.os.desktop
      ? "any key to begin\nESC key to pause\n TYPE ALL WORDS"
      : " tap to begin\n tap to pause\nTYPE ALL WORDS";
    const cta = this.add.text(0, 0, text, {
      fontFamily: "Courier",
      fontSize: "32px",
      fontStyle: "bold",
      color: "white",
      stroke: "black",
      strokeThickness: 4,
      testString: text,
    });
    cta.setOrigin(0.5, 0);
    cta.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.525,
    );
  }

  drawVersion() {
    const text = process.env.APP_VERSION || "unknown";
    const cta = this.add.text(0, 0, text.toUpperCase(), {
      font: "bold 16px Courier",
      color: "#888888",
    });
    cta.setOrigin(0.5, 1);
    cta.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height - 8,
    );
  }

  bindEvents() {
    if (this.game.device.os.desktop) {
      this.input.keyboard.once("keyup", this.startFight.bind(this));
    } else {
      this.input.once("pointerup", this.startFight.bind(this));
    }
  }

  startFight() {
    this.scene.start("fight", { music: this.music });
  }
}
