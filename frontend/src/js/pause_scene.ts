import "phaser";
import TEXT_STYLES from "./text_styles";

export default class PauseScene extends Phaser.Scene {
  music!: Phaser.Sound.BaseSound;
  enabled = true;
  manual = false;

  constructor() {
    super("pause");
  }

  create(data: { music: Phaser.Sound.BaseSound }) {
    this.music = data.music;
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
    this.add
      .text(0, 0, text, TEXT_STYLES.BASE)
      .setFontSize(64)
      .setOrigin(0.5, 1)
      .setPosition(this.cameras.main.centerX, this.cameras.main.centerY - 16);
  }

  drawCTA() {
    const verb = !this.manual
      ? "focus"
      : this.game.device.os.desktop
      ? "ESC"
      : "tap";
    const text = `TAKE A BREATH\n${verb} to resume`;
    this.add
      .text(0, 0, text, TEXT_STYLES.BASE)
      .setFontSize(32)
      .setOrigin(0.5, 0)
      .setPosition(this.cameras.main.centerX, this.cameras.main.centerY + 16);
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
