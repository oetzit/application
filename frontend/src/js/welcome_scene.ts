import "phaser";

export default class WelcomeScene extends Phaser.Scene {
  constructor() {
    super("welcome");
  }

  create() {
    this.drawTitle();
    this.drawCTA();
    this.drawVersion();
    this.bindEvents();
  }

  drawTitle() {
    const text = "ÖTZI\nGAME";
    const title = this.add.text(0, 0, text, {
      font: "bold 64px Courier",
      color: "#ffffff",
    });
    title.setOrigin(0.5, 0.5);
    title.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.4,
    );
  }

  drawCTA() {
    const text = "press to start";
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
    this.input.keyboard.once("keyup", this.startFight.bind(this));
    this.input.once("pointerup", this.startFight.bind(this));
  }

  startFight() {
    this.scene.start("fight");
  }
}
