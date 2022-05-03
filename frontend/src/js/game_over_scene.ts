import "phaser";
import BackgroundScene from "./background_scene";
import { formatTime, ICONS, THIN_SPACE } from "./hud";

export default class GameOverScene extends Phaser.Scene {
  music!: Phaser.Sound.BaseSound;

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

    this.drawTitle();
    this.drawSubtitle(data.words);
    this.drawResult(data.score, data.time);
    this.drawCTA();
    this.bindEvents();
  }

  drawTitle() {
    const text = "GAME OVER";
    const title = this.add.text(0, 0, text, {
      fontSize: "48px",
      fontFamily: "Courier",
      fontStyle: "bold",
      color: "#ff0000",
    });
    title.setOrigin(0.5, 1);
    title.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.2,
    );
  }

  drawSubtitle(wordCount = 1234) {
    const text = `You donated to our research\n${wordCount} WORDS\n${ICONS.HEALTH}${THIN_SPACE}Thank you!${THIN_SPACE}${ICONS.HEALTH}`; //
    const subtitle = this.add.text(0, 0, text, {
      fontSize: "28px",
      fontFamily: "Courier",
      fontStyle: "bold",
      color: "#aaff00",
      align: "center",
      testString: text,
    });
    subtitle.setOrigin(0.5, 0);
    subtitle.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.2 + 16,
    );
  }

  drawResult(score = 12345678, time = 12 * 60 * 1000 + 34 * 1000 + 56 * 10) {
    const timer = formatTime(time);
    const text = `${score}\u2009${ICONS.SCORE}\n${timer}\u2009${ICONS.CLOCK}`;
    const title = this.add.text(0, 0, text, {
      fontSize: "28px",
      fontFamily: "Courier",
      fontStyle: "bold",
      color: "#ffffff",
      align: "right",
      testString: text,
    });
    title.setOrigin(0.5, 1);
    title.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.8 - 16,
    );
  }

  drawCTA() {
    const text = "press to continue";
    const cta = this.add.text(0, 0, text, {
      fontSize: "32px",
      fontFamily: "Courier",
      fontStyle: "bold",
      color: "#ffffff",
    });
    cta.setOrigin(0.5, 0);
    cta.setPosition(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.8,
    );
  }

  bindEvents() {
    this.input.keyboard.once("keyup", this.startFight.bind(this));
    this.input.once("pointerup", this.startFight.bind(this));
  }

  startFight() {
    (this.scene.get("background") as BackgroundScene).liftCurtain();
    this.scene.start("welcome", { music: this.music });
  }
}
