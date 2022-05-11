import "phaser";
import { FONTS } from "./assets";

export default class PauseScene extends Phaser.Scene {
  pausedScene!: string;

  constructor() {
    super("pause");
  }

  create(data: { pausedScene: string }) {
    this.pausedScene = data.pausedScene;
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
    const text = "PAUSED";
    const title = this.add.text(0, 0, text, {
      fontFamily: FONTS.MONO,
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
      ? "  TAKE A BREATH\nESC key to resume"
      : "TAKE A BREATH\ntap to resume";
    const title = this.add.text(0, 0, text, {
      fontFamily: FONTS.MONO,
      fontSize: "32px",
      fontStyle: "bold",
      color: "white",
      stroke: "black",
      strokeThickness: 4,
      testString: text,
    });
    title.setOrigin(0.5, 0);
    title.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.525,
    );
  }

  bindResumeShortcut() {
    if (this.game.device.os.desktop) {
      const escBinding = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.ESC,
      );
      escBinding.onDown = () => this.resumePausedScene();
    } else {
      this.input.on("pointerup", () => this.resumePausedScene());
    }
  }

  resumePausedScene() {
    this.scene.resume(this.pausedScene);
  }
}
