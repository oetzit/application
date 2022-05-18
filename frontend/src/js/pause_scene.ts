import "phaser";
import TEXT_STYLES from "./text_styles";

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
    const fontSize = Math.min(this.cameras.main.height * 0.25, 64);
    this.add
      .text(0, 0, text, TEXT_STYLES.BASE)
      .setFontSize(fontSize)
      .setOrigin(0.5, 1)
      .setPosition(
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
    const fontSize = Math.min(this.cameras.main.height * 0.125, 32);
    this.add
      .text(0, 0, text, TEXT_STYLES.BASE)
      .setFontSize(fontSize)
      .setOrigin(0.5, 0)
      .setPosition(
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
