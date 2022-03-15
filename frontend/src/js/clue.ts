import "phaser";
import FightScene from "./fight_scene";

interface WordObject {
  id: string;
  image: string;
  ocr_confidence: number;
  ocr_transcript: string;
}

class Clue extends Phaser.GameObjects.Sprite {
  word: WordObject;
  scene: FightScene;

  constructor(scene: FightScene, word: WordObject) {
    // TODO: set positions
    super(scene, 400, 300, word.id);

    this.setAlpha(0);
    scene.add.existing(this);

    this.scene = scene;
    this.word = word;

    this.loadTexture();
  }

  loadTexture() {
    this.scene.textures.addBase64(this.word.id, this.word.image);
    this.scene.textures.once(
      "addtexture",
      this.showTexture.bind(this),
      this.scene,
    );
  }

  showTexture() {
    this.setTexture(this.word.id);
    this.body = new Phaser.Physics.Arcade.Body(this.scene.physics.world, this);
    this.scene.physics.world.add(this.body);
    this.scene.cluesGroup.add(this);

    const x =
      (this.scene.cameras.main.width - this.width - 10) * Math.random() +
      5 +
      this.width / 2;
    this.setPosition(x, 50);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      ease: "Linear",
      delay: 0,
      duration: 100,
    });
  }

  delete() {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      ease: "Linear",
      delay: 0,
      duration: 2000,
      onComplete: this.destroy.bind(this),
    });
  }
}

export default Clue;
