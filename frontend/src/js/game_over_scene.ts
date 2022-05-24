import "phaser";
import BackgroundScene from "./background_scene";
import Game from "./game";
import { formatTime, ICONS } from "./hud";
import { FightOutcome } from "./records";
import TEXT_STYLES, { makeButtonHoverable } from "./text_styles";

export default class GameOverScene extends Phaser.Scene {
  game!: Game;
  music!: Phaser.Sound.BaseSound;
  continueButton!: Phaser.GameObjects.Text;

  constructor() {
    super("game_over");
  }

  create() {
    (this.scene.get("background") as BackgroundScene).dropCurtain();
    (this.scene.get("background") as BackgroundScene).atmosphere
      .stop()
      .restart();
    this.music = this.sound.add("bkg_failure", { loop: false });
    this.music.play();

    this.drawTitle();
    this.drawSubtitle();
    this.drawResult();
    this.drawCTA();
    this.bindEvents();
  }

  drawTitle() {
    const text = "GAME OVER";
    const title = this.add.text(0, 0, text, {
      ...TEXT_STYLES.BASE,
      fontSize: "48px",
      color: "#ff0000",
      testString: text,
    });
    title.setOrigin(0.5, 0);
    title.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.1,
    );
  }

  drawSubtitle() {
    const text = `You contributed\n${ICONS.HEALTH} to our research! ${ICONS.HEALTH}\nThank you!`; //
    const subtitle = this.add.text(0, 0, text, {
      ...TEXT_STYLES.BASE,
      fontSize: "28px",
      color: "#aaff00",
      testString: text,
    });
    subtitle.setOrigin(0.5, 0);
    subtitle.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.2 + 16,
    );
  }

  formatResult({ score, timer, words }: FightOutcome) {
    let wordsLabel = words.toString();
    let scoreLabel = score.toString();
    let timerLabel = formatTime(timer);
    const labelWidth = Math.max(
      wordsLabel.length,
      scoreLabel.length,
      timerLabel.length,
    );
    wordsLabel = wordsLabel.padStart(labelWidth, " ") + " 🔤";
    scoreLabel = scoreLabel.padStart(labelWidth, " ") + " " + ICONS.SCORE;
    timerLabel = timerLabel.padStart(labelWidth, " ") + " " + ICONS.CLOCK;
    if (this.game.records.improved.score) scoreLabel += " 🏅";
    if (this.game.records.improved.timer) timerLabel += " 🏅";
    if (this.game.records.improved.words) wordsLabel += " 🏅";
    return [wordsLabel, scoreLabel, timerLabel].join("\n");
  }

  drawResult() {
    const text = this.formatResult(this.game.records.last);
    const title = this.add.text(0, 0, text, {
      ...TEXT_STYLES.BASE,
      fontSize: "28px",
      testString: text,
    });
    title.setOrigin(0.5, 0);
    title.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.5,
    );
    if (
      this.game.records.improved.score ||
      this.game.records.improved.timer ||
      this.game.records.improved.words
    ) {
      const newPB = this.add.text(0, 0, "You set new records!", {
        ...TEXT_STYLES.BASE,
        fontSize: "28px",
        testString: text,
      });
      newPB.setOrigin(0.5, 0);
      newPB.setPosition(
        this.cameras.main.width * 0.5,
        title.getBounds().bottom + 16,
      );
    }
  }

  drawCTA() {
    const verb = this.game.device.os.desktop ? "Click" : "Tap";
    const text = `${verb} to continue`;
    this.continueButton = this.add
      .text(this.cameras.main.centerX, this.cameras.main.height * 0.9, text, {
        ...TEXT_STYLES.BUTTON,
        fontSize: "32px",
      })
      .setOrigin(0.5, 1)
      .setPadding(4);
    makeButtonHoverable(this.continueButton);
  }

  bindEvents() {
    this.continueButton.on("pointerup", this.backToWelcome.bind(this));
  }

  backToWelcome() {
    (this.scene.get("background") as BackgroundScene).liftCurtain();
    this.scene.start("welcome");
  }
}
