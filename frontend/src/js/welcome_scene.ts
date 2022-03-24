import "phaser";

export default class WelcomeScene extends Phaser.Scene {
  constructor() {
    super("welcome");
  }

  create() {
    this.drawTitle();
    this.drawCTA();
    this.bindEvents();
  }

  drawTitle() {
    const text = "ÖTZI\nGAME";
    const title = this.add.text(0, 0, text, {
      font: "bold 64px Courier",
      color: "#ffffff",
    });
    title.setPosition(
      (this.cameras.main.width - title.width) * 0.5,
      (this.cameras.main.height - title.height) * 0.4,
    );
  }

  drawCTA() {
    const text = "press to start";
    const cta = this.add.text(0, 0, text, {
      font: "bold 32px Courier",
      color: "#ffffff",
    });
    cta.setPosition(
      (this.cameras.main.width - cta.width) * 0.5,
      (this.cameras.main.height - cta.height) * 0.7,
    );
  }

  bindEvents() {
    this.input.keyboard.once("keydown", this.startFight.bind(this));
    this.input.once("pointerdown", this.startFight.bind(this));
  }

  startFight() {
    this.scene.start("fight");
  }
}
