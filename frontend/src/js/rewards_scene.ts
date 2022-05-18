import "phaser";
import { FONTS } from "./assets";

import backend from "./backend";
import Game from "./game";
import PauseScene from "./pause_scene";

const BUTTON_HIGHLIGHT_COLOR = "darkorange";

// NOTE: see https://stackoverflow.com/a/26989421
const RFC_5322 = new RegExp(
  /^([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|"([]!#-[^-~ \t]|(\\[\t -~]))+")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])$/,
);

const TEXT_STYLE: {
  [key: string]: Phaser.Types.GameObjects.Text.TextStyle;
} = {
  MESSAGE: {
    fontFamily: FONTS.MONO,
    fontStyle: "bold",
    color: "#ffffff",
    fontSize: "32px",
    testString:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890",
    align: "center",
  },
  BUTTON: {
    fontFamily: FONTS.MONO,
    fontStyle: "bold",
    color: "white",
    stroke: "black",
    strokeThickness: 8,
    testString: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    fontSize: "32px",
  },
};

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
    const text = "We reward top players weekly! Enter your email to compete:";
    this.explanation = this.add
      .text(this.cameras.main.centerX, this.cameras.main.height * 0.1, text, {
        ...TEXT_STYLE.MESSAGE,
        testString: text,
        wordWrap: { width: this.cameras.main.width * 0.6 },
      })
      .setOrigin(0.5, 0);
  }

  createMailBox() {
    this.mailBox = this.add
      .text(this.cameras.main.centerX, this.cameras.main.centerY, "", {
        ...TEXT_STYLE.BUTTON,
        padding: { x: 16, y: 16 },
      })
      .setOrigin(0.5, 1)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () =>
        this.mailBox.setStyle({ stroke: BUTTON_HIGHLIGHT_COLOR }),
      )
      .on("pointerout", () =>
        this.mailBox.setStyle({ stroke: TEXT_STYLE.BUTTON.stroke }),
      );
    this.refreshMailBox();
  }

  createPrivacyNotice() {
    const text =
      "By filling the input you agree to our privacy policy. You can read it HERE 🖋️🤓";
    this.privacy = this.add
      .text(
        this.cameras.main.centerX,
        this.mailBox.getBounds().bottom + 16,
        text,
        {
          ...TEXT_STYLE.BUTTON,
          fontSize: "24px",
          testString: text,
          wordWrap: { width: this.cameras.main.width * 0.6 },
          align: "center",
        },
      )
      .setOrigin(0.5, 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () =>
        this.privacy.setStyle({ stroke: BUTTON_HIGHLIGHT_COLOR }),
      )
      .on("pointerout", () =>
        this.privacy.setStyle({ stroke: TEXT_STYLE.BUTTON.stroke }),
      );
  }

  createBackBtn() {
    const text = "Back to menu";
    this.backBtn = this.add
      .text(this.cameras.main.centerX, this.cameras.main.height * 0.9, text, {
        ...TEXT_STYLE.BUTTON,
      })
      .setOrigin(0.5, 1)
      .setPadding(4)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () =>
        this.backBtn.setStyle({ stroke: BUTTON_HIGHLIGHT_COLOR }),
      )
      .on("pointerout", () =>
        this.backBtn.setStyle({ stroke: TEXT_STYLE.BUTTON.stroke }),
      );
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
