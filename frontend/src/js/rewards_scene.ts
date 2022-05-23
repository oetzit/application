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

export default class RewardsScene extends Phaser.Scene {
  game!: Game;
  music!: Phaser.Sound.BaseSound;
  explanation!: Phaser.GameObjects.Text;
  privacy!: Phaser.GameObjects.Text;
  mailBox!: Phaser.GameObjects.Text;
  backBtn!: Phaser.GameObjects.Text;

  constructor() {
    super("rewards");
  }

  create(data: { music: Phaser.Sound.BaseSound }) {
    this.music = data.music;

    this.createExplanation();
    this.createMailBox();
    this.createPrivacyNotice();
    this.createBackBtn();
    this.bindEvents();

    this.setPauseEnabled(false);
  }

  createExplanation() {
    const text = "We reward top players weekly!\nEnter your email to compete:";
    const fontSize = Math.min(this.cameras.main.height * 0.125, 24);
    this.explanation = this.add
      .text(0, 0, text, TEXT_STYLES.BASE)
      .setFontSize(fontSize)
      .setOrigin(0.5, 0)
      .setPosition(this.cameras.main.centerX, this.cameras.main.height * 0.05);
  }

  createMailBox() {
    this.mailBox = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "",
        TEXT_STYLES.BUTTON,
      )
      .setOrigin(0.5, 1)
      .setPadding(16);
    makeButtonHoverable(this.mailBox);
    this.refreshMailBox();
  }

  createPrivacyNotice() {
    const text =
      "By filling the input you agree to our privacy policy.\nYou can read it HERE 🖋️🤓";
    const fontSize = Math.min(this.cameras.main.height * 0.125, 16);
    this.privacy = this.add
      .text(
        this.cameras.main.centerX,
        this.mailBox.getBounds().bottom + 16,
        text,
        {
          ...TEXT_STYLES.BUTTON,
          testString: text,
          align: "center",
        },
      )
      .setFontSize(fontSize)
      .setOrigin(0.5, 0);
    makeButtonHoverable(this.privacy);
  }

  createBackBtn() {
    const text = "Back to menu";
    const fontSize = Math.min(this.cameras.main.height * 0.25, 32);
    this.backBtn = this.add
      .text(0, 0, text, TEXT_STYLES.BUTTON)
      .setFontSize(fontSize)
      .setOrigin(0.5, 1)
      .setPosition(this.cameras.main.centerX, this.cameras.main.height * 0.95);
    makeButtonHoverable(this.backBtn);
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
