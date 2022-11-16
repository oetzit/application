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

  title!: Phaser.GameObjects.Text;
  subtitle!: Phaser.GameObjects.Text;
  resultsCaption!: Phaser.GameObjects.Text;
  resultsTable!: Phaser.GameObjects.Text;

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

    this.title = this.createTitle();
    this.subtitle = this.createSubtitle();
    this.resultsTable = this.createResultsTable();
    this.resultsCaption = this.createResultsCaption();
    this.createContinueBtn();
    this.bindEvents();
  }

  createTitle() {
    const text = "GAME OVER";
    return this.add
      .text(0, 0, text, {
        ...TEXT_STYLES.BASE,
        fontSize: "48px",
        color: "#ff0000",
        testString: text,
      })
      .setOrigin(0.5, 0)
      .setPosition(this.cameras.main.centerX, 32);
  }

  createSubtitle() {
    const text = "You contributed to research!";
    return this.add
      .text(0, 0, text, {
        ...TEXT_STYLES.BASE,
        fontSize: "24px",
        color: "#aaff00",
        testString: text,
      })
      .setOrigin(0.5, 0)
      .setPosition(this.cameras.main.centerX, this.cameras.main.height * 0.25);
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

  createResultsTable() {
    const text = this.formatResult(this.game.records.last);
    return this.add
      .text(0, 0, text, {
        ...TEXT_STYLES.BASE,
        fontSize: "24px",
        testString: text,
      })
      .setOrigin(0.5, 0)
      .setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
  }

  createResultsCaption() {
    const text =
      this.game.records.improved.score ||
      this.game.records.improved.timer ||
      this.game.records.improved.words
        ? "You set new personal records:"
        : "Here are your scores:";
    return this.add
      .text(0, 0, text, {
        ...TEXT_STYLES.BASE,
        fontSize: "24px",
        testString: text,
      })
      .setOrigin(0.5, 1)
      .setPosition(
        this.cameras.main.width * 0.5,
        this.resultsTable.getBounds().top - 16,
      );
  }

  createContinueBtn() {
    const verb = this.game.device.os.desktop ? "Click" : "Tap";
    const text = `${verb} to continue`;
    this.continueButton = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.height - 16,
        text,
        TEXT_STYLES.BUTTON,
      )
      .setOrigin(0.5, 1);
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
