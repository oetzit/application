import "phaser";
import FightScene from "./fight_scene";

import * as Types from "../../../backend/src/types";

class Clue extends Phaser.GameObjects.Sprite {
  word: Types.Word;
  scene: FightScene;

  constructor(scene: FightScene, word: Types.Word) {
    // TODO: set positions
    super(scene, 400, 300, word.id);
    scene.add.existing(this);

    this.setAlpha(0);

    this.scene = scene;
    this.word = word;

    this.loadTexture();
  }

  loadTexture() {
    // this.scene.textures.remove()
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
    this.fadeIn();
  }

  delete() {
    this.fadeOut(() => {
      this.scene.textures.remove(this.texture); // TODO
      this.destroy.bind(this);
    });
  }

  fadeIn(onComplete?: Phaser.Types.Tweens.TweenOnCompleteCallback) {
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      ease: "Linear",
      delay: 0,
      duration: 100,
      onComplete: onComplete,
    });
  }

  fadeOut(onComplete?: Phaser.Types.Tweens.TweenOnCompleteCallback) {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      ease: "Linear",
      delay: 0,
      duration: 100,
      onComplete: onComplete,
    });
  }
}

export default Clue;
