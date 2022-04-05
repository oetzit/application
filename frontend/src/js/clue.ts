import "phaser";
import FightScene from "./fight_scene";

import * as Types from "../../../backend/src/types";

const BASE_HEIGHT = 25;

// const HYPERASCENDERS = /[ÄÖÜ]/;
const ASCENDERS = /[ABCDEFGHIJKLMNOPQRSTUVWXYZbdfhijklstäöüß]/;
const DESCENDERS = /[AFHJPQYZÄfghjpqsyzß]/;

const CONCEAL_TINT = 0xaaaaaa;

class Clue extends Phaser.GameObjects.Sprite {
  word: Types.Word;
  scene: FightScene;
  textureKey: string;
  body: Phaser.Physics.Arcade.Body;

  constructor(scene: FightScene, word: Types.Word) {
    // TODO: set positions
    super(scene, 0, 0, "__MISSING");
    scene.add.existing(this);

    this.setAlpha(0);

    this.scene = scene;
    this.word = word;

    // TODO: we could be smarter and fully leverage caching, but meh.
    this.textureKey = `${word.id}-${Date.now()}`;
    this.loadTexture();
  }

  loadTexture() {
    // this.scene.textures.remove()
    this.scene.textures.addBase64(this.textureKey, this.word.image);
    this.scene.textures.once(
      "addtexture",
      this.showTexture.bind(this),
      this.scene,
    );
  }

  estimateWordHeight() {
    let height = 1.0;
    // if (this.word.ocr_transcript.match(HYPERASCENDERS)) height += 0.2;
    if (this.word.ocr_transcript.match(ASCENDERS)) height += 0.2;
    if (this.word.ocr_transcript.match(DESCENDERS)) height += 0.2;
    return height;
  }

  applyTexture() {
    this.setTexture(this.textureKey);
    const scale =
      (this.estimateWordHeight() * BASE_HEIGHT) /
      this.texture.getSourceImage().height;
    this.setScale(scale);
  }

  showTexture() {
    if (!this.scene.scene.isActive()) return;
    this.applyTexture();
    this.body = new Phaser.Physics.Arcade.Body(this.scene.physics.world, this);
    this.scene.physics.world.add(this.body);
    this.scene.cluesGroup.add(this);
    this.setPositionForDrop();
    this.fadeIn();
  }

  setPositionForDrop() {
    const bounds = this.body.customBoundsRectangle;
    const x =
      bounds.left +
      this.displayWidth * 0.5 +
      Math.random() * (bounds.width - this.displayWidth);
    const y = bounds.top + this.displayHeight * 0.5;
    this.setPosition(x, y);
  }

  delete() {
    this.fadeOut(() => {
      this.texture.destroy();
      this.destroy();
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

  uncover() {
    this.clearTint();
  }

  conceal() {
    this.setTintFill(CONCEAL_TINT);
  }
}

export default Clue;
