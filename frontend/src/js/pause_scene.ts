import "phaser";

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super("pause");
  }

  create() {
    this.drawShade();
    this.drawTitle();
    this.drawCTA();
    this.bindResumeShortcut();
  }

  drawShade() {
    this.add
      .rectangle(
        0,
        0,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.75,
      )
      .setOrigin(0, 0);
  }

  drawTitle() {
    const text = "PAUSE";
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
    const text = this.game.device.os.desktop
      ? "  TAKE A BREATH\nESC key to resume"
      : "TAKE A BREATH\ntap to resume";
    const title = this.add.text(0, 0, text, {
      font: "bold 24px Courier",
      color: "#ffffff",
    });
    title.setOrigin(0.5, 0.5);
    title.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.6,
    );
  }

  bindResumeShortcut() {
    if (this.game.device.os.desktop) {
      const escBinding = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.ESC,
      );
      escBinding.onDown = () => this.scene.resume("fight");
    } else {
      this.input.on("pointerup", () => this.scene.resume("fight"));
    }
  }
}
