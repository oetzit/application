import "phaser";
import FightScene from "./fight_scene";

import * as Types from "../../../backend/src/types";

// const HYPERASCENDERS = /[ÄÖÜ]/;
const ASCENDERS = /[ABCDEFGHIJKLMNOPQRSTUVWXYZbdfhijklstäöüß]/;
const DESCENDERS = /[AFHJPQYZÄfghjpqsyzß]/;

const CONCEAL_TINT = 0xaaaaaa;

class Clue extends Phaser.GameObjects.Sprite {
  word: Types.Word;
  scene: FightScene;
  textureKey: string;
  body: Phaser.Physics.Arcade.Body;
  baseHeight: number;

  constructor(scene: FightScene, word: Types.Word) {
    // TODO: set positions
    super(scene, 0, 0, "__MISSING");
    scene.add.existing(this);

    this.setAlpha(0);

    this.scene = scene;
    this.word = word;

    this.baseHeight = Math.max(this.scene.cameras.main.width * 0.035, 25); // max(3.5vw,25px)

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
      (this.estimateWordHeight() * this.baseHeight) /
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
    const x = this.findBestDropPosition(bounds, this.scene.cluesGroup.children);
    // const x = this.findRandDropPosition(bounds);
    const y = bounds.top + this.displayHeight * 0.5;
    this.setPosition(x, y);
  }

  findRandDropPosition(bounds: Phaser.Geom.Rectangle) {
    return (
      bounds.left +
      this.displayWidth * 0.5 +
      Math.random() * (bounds.width - this.displayWidth)
    );
  }

  findBestDropPosition(
    bounds: Phaser.Geom.Rectangle,
    siblings: Phaser.Structs.Set<Phaser.GameObjects.GameObject>,
    pad = 10,
  ) {
    const minX = Math.ceil(bounds.left);
    const maxX = Math.floor(bounds.right);
    const xCount = maxX - minX + 1;
    const xScores = Array(xCount).fill(0);

    xScores.forEach((_, i, xs) => {
      (siblings as Phaser.Structs.Set<Clue>).each((clue) => {
        if (clue == this) return;
        const clueBounds = clue.getBounds();
        const x = i + minX;
        let intersect = true;
        intersect &&= clueBounds.left - pad < x;
        intersect &&= x < clueBounds.right + pad;
        const pileHeight = bounds.bottom - clueBounds.bottom;
        xs[i] += (intersect ? 1 : 0) * pileHeight;
      });
    });

    const boxWidth = Math.ceil(this.displayWidth);
    const boxPosScores = Array(xCount - boxWidth).fill(0);

    boxPosScores.forEach((_, i, ps) => {
      ps[i] = xScores.slice(i, i + boxWidth).reduce((a, b) => a + b, 0);
    });

    const bestBoxPos = boxPosScores.indexOf(Math.min(...boxPosScores));

    return bounds.left + 0.5 * this.displayWidth + bestBoxPos;
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
