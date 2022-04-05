const ICONS = {
  SCORE: "️⭐️",
  HEALTH: "❤️️",
};

export default class HUD {
  scene: Phaser.Scene;
  input: Phaser.GameObjects.Text;
  score: Phaser.GameObjects.Text;
  health: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.input = this.initInput(scene);
    this.score = this.initScore(scene);
    this.health = this.initHealth(scene);
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
    return scene.add
      .text(10, 10, "", {
        font: "bold 32px Courier",
        color: "lightgreen",
        testString: `${ICONS.SCORE}100000`,
      })
      .setOrigin(0, 0);
  }

  initHealth(scene: Phaser.Scene) {
    return scene.add
      .text(scene.cameras.main.width - 10, 10, "", {
        font: "bold 32px Courier",
        color: "orange",
        testString: `100 ${ICONS.HEALTH}`,
      })
      .setOrigin(1, 0);
  }

  setInput(input: string) {
    this.input.text = input;
  }

  setScore(score: number) {
    this.score.text = `${ICONS.SCORE}${score}`;
  }

  setHealth(health: number) {
    this.health.text = `${health}${ICONS.HEALTH}`;
  }
}
