import "phaser";
import BackgroundScene from "./background_scene";
import { formatTime, ICONS } from "./hud";
import TEXT_STYLES from "./text_styles";

const SS_KEYS = {
  BEST_WORDS: "OETZIT/BEST_WORDS",
  BEST_SCORE: "OETZIT/BEST_SCORE",
  BEST_TIMER: "OETZIT/BEST_TIMER",
};

export default class GameOverScene extends Phaser.Scene {
  music!: Phaser.Sound.BaseSound;
  continueButton!: Phaser.GameObjects.Text;

  beatScore!: boolean;
  beatTimer!: boolean;
  beatWords!: boolean;

  constructor() {
    super("game_over");
  }

  preload() {}

  musicHardReplace(
    nextMusic: Phaser.Sound.BaseSound,
    prevMusic?: Phaser.Sound.BaseSound,
  ) {
    prevMusic?.stop();
    prevMusic?.destroy();
    this.music = nextMusic;
    this.music.play();
  }

  create(data: {
    music?: Phaser.Sound.BaseSound;
    words: number;
    score: number;
    time: number;
  }) {
    (this.scene.get("background") as BackgroundScene).dropCurtain();
    (this.scene.get("background") as BackgroundScene).atmosphere
      .stop()
      .restart();
    this.musicHardReplace(
      this.sound.add("bkg_failure", { loop: false }),
      data.music,
    );

    this.processRecords(data.score, data.time, data.words);

    this.drawTitle();
    this.drawSubtitle();
    this.drawResult(data.words, data.score, data.time);
    this.drawCTA();
    this.bindEvents();
  }

  processRecords(score: number, timer: number, words: number) {
    const bestScore = sessionStorage.getItem(SS_KEYS.BEST_SCORE);
    const bestTimer = sessionStorage.getItem(SS_KEYS.BEST_TIMER);
    const bestWords = sessionStorage.getItem(SS_KEYS.BEST_WORDS);
    this.beatScore = bestScore === null || parseInt(bestScore) < score;
    this.beatTimer = bestTimer === null || parseInt(bestTimer) < timer;
    this.beatWords = bestWords === null || parseInt(bestWords) < words;
    sessionStorage.setItem(SS_KEYS.BEST_SCORE, score.toString());
    sessionStorage.setItem(SS_KEYS.BEST_TIMER, timer.toString());
    sessionStorage.setItem(SS_KEYS.BEST_WORDS, words.toString());
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

  formatResult(words: number, score: number, time: number) {
    let wordsLabel = words.toString();
    let scoreLabel = score.toString();
    let timerLabel = formatTime(time);
    const labelWidth = Math.max(
      wordsLabel.length,
      scoreLabel.length,
      timerLabel.length,
    );
    wordsLabel = wordsLabel.padStart(labelWidth, " ") + " 🔤";
    scoreLabel = scoreLabel.padStart(labelWidth, " ") + " " + ICONS.SCORE;
    timerLabel = timerLabel.padStart(labelWidth, " ") + " " + ICONS.CLOCK;
    if (this.beatScore) scoreLabel += " 🏅";
    if (this.beatTimer) timerLabel += " 🏅";
    if (this.beatWords) wordsLabel += " 🏅";
    return [wordsLabel, scoreLabel, timerLabel].join("\n");
  }

  drawResult(
    words = 1234,
    score = 12345678,
    time = 12 * 60 * 1000 + 34 * 1000 + 56 * 10,
  ) {
    const text = this.formatResult(words, score, time);
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
    if (this.beatScore || this.beatTimer || this.beatWords) {
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
      .setPadding(4)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () =>
        this.continueButton.setStyle({
          stroke: TEXT_STYLES.BUTTON_HOVER.stroke,
        }),
      )
      .on("pointerout", () =>
        this.continueButton.setStyle({ stroke: TEXT_STYLES.BUTTON.stroke }),
      );
  }

  bindEvents() {
    this.continueButton.on("pointerup", this.backToWelcome.bind(this));
  }

  backToWelcome() {
    (this.scene.get("background") as BackgroundScene).liftCurtain();
    this.scene.start("welcome", { music: this.music });
  }
}
