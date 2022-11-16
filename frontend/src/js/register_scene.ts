import "phaser";

import backend from "./backend";
import Game from "./game";
import PauseScene from "./pause_scene";
import TEXT_STYLES, { makeButtonHoverable } from "./text_styles";

// NOTE: see https://stackoverflow.com/a/26989421
const RFC_5322 = new RegExp(
  // eslint-disable-next-line no-empty-character-class
  /^([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|"([]!#-[^-~ \t]|(\\[\t -~]))+")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])$/,
);

export default class RegisterScene extends Phaser.Scene {
  game!: Game;
  music!: Phaser.Sound.BaseSound;
  heading!: Phaser.GameObjects.Text;
  privacy!: Phaser.GameObjects.Text;
  mailBox!: Phaser.GameObjects.Text;
  backBtn!: Phaser.GameObjects.Text;

  constructor() {
    super("register");
  }

  create(data: { music: Phaser.Sound.BaseSound }) {
    this.music = data.music;

    this.mailBox = this.createMailBox();
    this.heading = this.createHeading();
    this.privacy = this.createPrivacy();
    this.backBtn = this.createBackBtn();

    this.refreshMailBox();

    makeButtonHoverable(this.mailBox);
    makeButtonHoverable(this.privacy);
    makeButtonHoverable(this.backBtn);

    this.bindEvents();

    this.setPauseEnabled(false);
  }

  createHeading() {
    const text =
      "Are you a participating\nin a workshop/competition?\n\nEnter your email below\nto identify yourself:";
    return this.add
      .text(0, 0, text, TEXT_STYLES.BASE)
      .setOrigin(0.5, 1)
      .setPosition(
        this.cameras.main.centerX,
        this.mailBox.getBounds().top - 32,
      );
  }

  createMailBox() {
    return this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "",
        TEXT_STYLES.BUTTON,
      )
      .setFontSize(20)
      .setOrigin(0.5, 0.5);
  }

  createPrivacy() {
    const verb = this.game.device.os.desktop ? "Click" : "Tap";
    const text = `Please note that by filling in the input you\naccept our privacy policy. ${verb} here to read it.`;
    return this.add
      .text(0, 0, text, {
        ...TEXT_STYLES.BUTTON,
        testString: text,
        align: "center",
      })
      .setFontSize(12)
      .setOrigin(0.5, 0)
      .setPosition(
        this.cameras.main.centerX,
        this.mailBox.getBounds().bottom + 32,
      );
  }

  createBackBtn() {
    const text = "Back to menu";
    return this.add
      .text(0, 0, text, TEXT_STYLES.BUTTON)
      .setOrigin(0.5, 1)
      .setPosition(this.cameras.main.centerX, this.cameras.main.height - 16);
  }

  bindEvents() {
    this.mailBox.on("pointerup", this.changeEmail.bind(this));
    this.backBtn.on("pointerup", this.backToWelcome.bind(this));
    this.privacy.on("pointerup", this.openPrivacyPolicy.bind(this));
  }

  async changeEmail() {
    const oldMail = this.game.beDevice.email;
    const newMail = prompt(
      "Please insert, update or delete your email in the field below.\nTo unsubscribe simply submit an empty field.",
      oldMail ?? "",
    );
    if (newMail === null) return;
    if (newMail == "" || newMail.match(RFC_5322)) {
      await this.updateDevice(newMail === "" ? null : newMail);
      this.refreshMailBox();
    } else {
      alert(
        `Sorry, you entered "${newMail}" but that does not look like an email.\nTo unsubscribe simply submit an empty field.`,
      );
    }
  }

  async updateDevice(email: string | null) {
    this.game.beDevice = (
      await backend.updateDevice(this.game.beDevice.id, {
        email: email,
      })
    ).data;
  }

  refreshMailBox() {
    const email = this.game.beDevice.email;
    if (email) {
      this.mailBox.setText(email).setBackgroundColor("#363");
    } else {
      this.mailBox.setText("No email given").setBackgroundColor("#633");
    }
  }

  backToWelcome() {
    this.setPauseEnabled(true);
    this.scene.start("welcome", { music: this.music });
  }

  setPauseEnabled(enabled: boolean) {
    // NOTE: we need to enable/disable pausing because modals quirk the focus
    (this.scene.get("pause") as PauseScene).enabled = enabled;
  }

  openPrivacyPolicy() {
    const url = "https://www.eurac.edu/en/static/privacy-policy-website";
    window.open(url, "_blank");
  }
}
