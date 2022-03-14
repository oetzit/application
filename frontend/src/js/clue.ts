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

  constructor(scene: FightScene, word: WordObject) {
    // TODO: set positions
    super(scene, 400, 300, word.id);

    this.setAlpha(0);
    this.scene.add.existing(this);

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
    const x =
      (this.scene.cameras.main.width - this.width - 100) * Math.random();
    const y = (400 - 100) * Math.random() + 100;
    this.setPosition(x, y);
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
