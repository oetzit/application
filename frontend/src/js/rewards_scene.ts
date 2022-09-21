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
  fontSize!: number;
  heading!: Phaser.GameObjects.Text;
  stepOne!: Phaser.GameObjects.Text;
  privacy!: Phaser.GameObjects.Text;
  mailBox!: Phaser.GameObjects.Text;
  stepTwo!: Phaser.GameObjects.Text;
  formIta!: Phaser.GameObjects.Text;
  formDeu!: Phaser.GameObjects.Text;
  backBtn!: Phaser.GameObjects.Text;

  constructor() {
    super("rewards");
  }

  create(data: { music: Phaser.Sound.BaseSound }) {
    this.music = data.music;

    this.fontSize = Math.min(
      this.cameras.main.height * 0.06,
      this.cameras.main.width * 0.03,
    );

    this.heading = this.createHeading();
    this.stepOne = this.createStepOne();
    this.mailBox = this.createMailBox();
    this.privacy = this.createPrivacy();
    this.stepTwo = this.createStepTwo();
    this.formIta = this.createFormIta();
    this.formDeu = this.createFormDeu();
    this.backBtn = this.createBackBtn();

    this.refreshMailBox();

    makeButtonHoverable(this.mailBox);
    makeButtonHoverable(this.privacy);
    makeButtonHoverable(this.formIta);
    makeButtonHoverable(this.formDeu);
    makeButtonHoverable(this.backBtn);

    this.bindEvents();

    this.setPauseEnabled(false);
  }

  createHeading() {
    const text =
      "Are you a young South Tyrolean?\nYou can play to win prizes in two steps!";
    return this.add
      .text(0, 0, text, TEXT_STYLES.BASE)
      .setFontSize(this.fontSize)
      .setOrigin(0.5, 0)
      .setPosition(this.cameras.main.centerX, this.cameras.main.height * 0.05);
  }

  createStepOne() {
    const text = "1. Enter your email here:";
    return this.add
      .text(0, 0, text, TEXT_STYLES.BASE)
      .setFontSize(this.fontSize)
      .setOrigin(0.5, 0)
      .setPosition(
        this.cameras.main.centerX,
        this.heading.getBounds().bottom + this.fontSize * 0.6,
      );
  }

  createMailBox() {
    return this.add
      .text(
        this.cameras.main.centerX,
        this.stepOne.getBounds().bottom,
        "",
        TEXT_STYLES.BUTTON,
      )
      .setFontSize(this.fontSize)
      .setOrigin(0.5, 0);
  }

  createPrivacy() {
    const verb = this.game.device.os.desktop ? "Click" : "Tap";
    const text = `Filling in the input you accept our privacy policy. ${verb} read it.`;
    return this.add
      .text(this.cameras.main.centerX, this.mailBox.getBounds().bottom, text, {
        ...TEXT_STYLES.BUTTON,
        testString: text,
        align: "center",
      })
      .setFontSize(this.fontSize * 0.6)
      .setOrigin(0.5, 0);
  }

  createStepTwo() {
    const text = "2. Register on either form:";
    return this.add
      .text(0, 0, text, TEXT_STYLES.BASE)
      .setFontSize(this.fontSize)
      .setOrigin(0.5, 0)
      .setPosition(
        this.cameras.main.centerX,
        this.privacy.getBounds().bottom + this.fontSize * 0.6,
      );
  }

  createFormIta() {
    const text = "Italiano";
    return this.add
      .text(0, 0, text, TEXT_STYLES.BASE)
      .setFontSize(this.fontSize)
      .setOrigin(1, 0)
      .setPosition(
        this.cameras.main.centerX - this.fontSize * 0.5,
        this.stepTwo.getBounds().bottom + this.fontSize * 0.25,
      );
  }

  createFormDeu() {
    const text = "Deutsch";
    return this.add
      .text(0, 0, text, TEXT_STYLES.BASE)
      .setFontSize(this.fontSize)
      .setOrigin(0, 0)
      .setPosition(
        this.cameras.main.centerX + this.fontSize * 0.5,
        this.stepTwo.getBounds().bottom + this.fontSize * 0.25,
      );
  }

  createBackBtn() {
    const text = "Back to menu";
    const fontSize = Math.min(this.cameras.main.height * 0.25, 32);
    return this.add
      .text(0, 0, text, TEXT_STYLES.BUTTON)
      .setFontSize(fontSize)
      .setOrigin(0.5, 1)
      .setPosition(this.cameras.main.centerX, this.cameras.main.height * 0.95);
  }

  bindEvents() {
    this.mailBox.on("pointerup", this.changeEmail.bind(this));
    this.backBtn.on("pointerup", this.backToWelcome.bind(this));
    this.privacy.on("pointerup", this.openPrivacyPolicy.bind(this));
    this.formIta.on("pointerup", this.openFormIta.bind(this));
    this.formDeu.on("pointerup", this.openFormDeu.bind(this));
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

  openFormIta() {
    const url =
      "https://docs.google.com/forms/d/e/1FAIpQLSd8z7OTUN_cUWJmQGnsq_tjcnFq0g_fJut6rexIBZrFE68NcQ/viewform";
    window.open(url, "_blank");
  }

  openFormDeu() {
    const url =
      "https://docs.google.com/forms/d/e/1FAIpQLSfIjqC-3REfQwUHRUCuIkhZ0oa1nQMCr7m5UDJwwhBidl1MDg/viewform";
    window.open(url, "_blank");
  }
}
