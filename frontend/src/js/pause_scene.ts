import "phaser";
import { FONTS } from "./assets";

export default class PauseScene extends Phaser.Scene {
  enabled = true;
  manual = false;

  constructor() {
    super("pause");
  }

  create() {
    this.drawShade();
    this.drawTitle();
    this.drawCTA();
    this.bindManualResume();
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
    const verb = !this.manual
      ? "focus"
      : this.game.device.os.desktop
      ? "ESC"
      : "tap";
    const text = `TAKE A BREATH\n${verb} to resume`;
    const title = this.add.text(0, 0, text, {
      fontFamily: FONTS.MONO,
      fontSize: "32px",
      fontStyle: "bold",
      color: "white",
      stroke: "black",
      strokeThickness: 4,
      testString: text,
      align: "center",
    });
    title.setOrigin(0.5, 0);
    title.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.525,
    );
  }

  focusPause(manual: boolean) {
    if (!this.enabled) return;
    this.manual ||= manual;
    if (this.scene.isActive()) return;
    this.game.scene
      .getScenes(false)
      .filter((scene) => scene.scene.isVisible())
      .forEach((scene) => scene.scene.pause());
    this.scene.start();
  }

  focusResume(manual: boolean) {
    if (!this.enabled) return;
    if (this.manual && !manual) return;
    if (!this.scene.isActive()) return;
    this.manual = false;
    this.game.scene
      .getScenes(false)
      .filter((scene) => scene.scene.isVisible())
      .forEach((scene) => scene.scene.resume());
    this.scene.stop();
  }

  bindManualResume() {
    if (this.game.device.os.desktop) {
      const escBinding = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.ESC,
      );
      escBinding.onDown = () => this.focusResume(true);
    } else {
      this.input.on("pointerup", () => this.focusResume(true));
    }
  }
}
