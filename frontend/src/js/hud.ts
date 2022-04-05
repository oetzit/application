const ICONS = {
  SCORE: "️⭐️",
  CLOCK: "⏲️",
  HEALTH: "❤️️",
};

const DEFAULT_TEXT_STYLE = {
  font: "bold 24px Courier",
  color: "white",
  testString: `${ICONS.CLOCK}${ICONS.HEALTH}${ICONS.SCORE}1234567890:.`,
  stroke: "black",
  strokeThickness: 4,
} as Phaser.Types.GameObjects.Text.TextStyle;

export default class HUD {
  scene: Phaser.Scene;
  input: Phaser.GameObjects.Text;
  score: Phaser.GameObjects.Text;
  clock: Phaser.GameObjects.Text;
  health: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.input = this.initInput(scene);
    this.score = this.initScore(scene);
    this.health = this.initHealth(scene);
    this.clock = this.initClock(scene);
  }

  initInput(scene: Phaser.Scene) {
    return scene.add
      .text(scene.cameras.main.width / 2, scene.cameras.main.height / 2, "", {
        font: "bold 64px Courier",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);
  }

  initScore(scene: Phaser.Scene) {
    return scene.add.text(10, 10, "", DEFAULT_TEXT_STYLE).setOrigin(0, 0);
  }

  initHealth(scene: Phaser.Scene) {
    return scene.add
      .text(scene.cameras.main.width - 10, 10, "", DEFAULT_TEXT_STYLE)
      .setOrigin(1, 0);
  }

  initClock(scene: Phaser.Scene) {
    return scene.add
      .text(
        scene.cameras.main.width * 0.5,
        10,
        `${ICONS.CLOCK}1:23.32`,
        DEFAULT_TEXT_STYLE,
      )
      .setOrigin(0.5, 0);
  }

  setInput(input: string) {
    this.input.text = input;
  }

  setScore(score: number) {
    this.score.text = `${ICONS.SCORE} ${score}`;
  }

  setHealth(health: number) {
    this.health.text = `${health} ${ICONS.HEALTH}`;
  }

  setClock(milliseconds: number) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    const hundredths = Math.floor((milliseconds % 1000) / 10)
      .toString()
      .padStart(2, "0");
    const formatted = `${minutes}:${seconds}.${hundredths}`;
    this.clock.text = `${formatted} ${ICONS.CLOCK}`;
  }
}
