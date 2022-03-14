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
      duration: 500,
    });
    this.destroy();
  }
}

export default Clue;
