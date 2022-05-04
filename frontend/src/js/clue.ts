import "phaser";
import FightScene from "./fight_scene";

import * as Types from "../../../backend/src/types";
import { FONTS } from "./assets";

// const HYPERASCENDERS = /[ÄÖÜ]/;
const ASCENDERS = /[ABCDEFGHIJKLMNOPQRSTUVWXYZbdfhijklstäöüß]/;
const DESCENDERS = /[AFHJPQYZÄfghjpqsyzß]/;

const CONCEAL_TINT = 0xaaaaaa;

interface CluePayload {
  word: Types.Word;
  loadWord: (word: Types.Word) => void;
  delete: () => void;
}

class TextCluePayload extends Phaser.GameObjects.Text implements CluePayload {
  word: Types.Word;

  constructor(scene: FightScene) {
    super(scene, 0, 0, "", {
      fontSize: "48px",
      fontFamily: FONTS.FRAK,
      fontStyle: "bold",
      color: "white",
      stroke: "black",
      strokeThickness: 8,
    });
    scene.add.existing(this);
    this.setAlpha(0);
  }

  loadWord(word: Types.Word) {
    this.word = word;
    this.setText(this.word.ocr_transcript);
    this.emit("CLUE_PAYLOAD_READY");
  }

  delete() {
    this.destroy();
  }
}

class SpriteCluePayload
  extends Phaser.GameObjects.Sprite
  implements CluePayload
{
  word: Types.Word;

  textureKey: string;
  baseHeight: number;

  constructor(scene: FightScene) {
    super(scene, 0, 0, "__MISSING");
    scene.add.existing(this);
    this.setAlpha(0);
    this.baseHeight = Math.max(this.scene.cameras.main.width * 0.035, 30); // max(3.5vw,32px)
  }

  loadWord(word: Types.Word) {
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
      () => {
        this.applyTexture();
        this.emit("CLUE_PAYLOAD_READY");
      },
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

  delete() {
    this.texture.destroy();
    this.destroy();
  }
}

class Clue {
  scene: FightScene;
  word: Types.Word;
  duration: number;
  payload: TextCluePayload | SpriteCluePayload;

  constructor(scene: FightScene, word: Types.Word, duration: number) {
    this.scene = scene;
    this.word = word;
    this.duration = duration;

    // this.payload = new TextCluePayload(this.scene);
    this.payload = new SpriteCluePayload(this.scene);

    this.payload.once("CLUE_PAYLOAD_READY", this.showTexture.bind(this));
    this.payload.loadWord(word);
  }

  showTexture() {
    if (!this.scene.scene.isActive()) return;
    this.scene.physics.add.existing(this.payload);
    this.scene.cluesGroup.add(this.payload);
    this.setPositionForDrop();
    this.fadeIn();
    this.createExpirationTween();
  }

  createExpirationTween() {
    this.scene.tweens.addCounter({
      from: 255,
      to: 64,
      delay: this.duration * 1000 * 0.5,
      duration: this.duration * 1000 * 0.5,
      ease: Phaser.Math.Easing.Expo.In,
      onUpdate: (tween) => {
        const value = Math.floor(tween.getValue());
        this.payload.setTint(Phaser.Display.Color.GetColor(255, value, value));
      },
    });
  }

  setPositionForDrop() {
    const bounds = this.payload.body.customBoundsRectangle;
    const x = this.findBestDropPosition(bounds, this.scene.cluesGroup.children);
    // const x = this.findRandDropPosition(bounds);
    const y = bounds.top + this.payload.displayHeight * 0.5;
    this.payload.setPosition(x, y);
  }

  findRandDropPosition(bounds: Phaser.Geom.Rectangle) {
    return (
      bounds.left +
      this.payload.displayWidth * 0.5 +
      Math.random() * (bounds.width - this.payload.displayWidth)
    );
  }

  findBestDropPosition(
    bounds: Phaser.Geom.Rectangle,
    siblings: Phaser.Structs.Set<
      Phaser.GameObjects.Text | Phaser.GameObjects.Sprite
    >,
    pad = 10,
  ) {
    const minX = Math.ceil(bounds.left);
    const maxX = Math.floor(bounds.right);
    const xCount = maxX - minX + 1;
    const xScores = Array(xCount).fill(0);

    xScores.forEach((_, i, xs) => {
      siblings.each((cluePayload) => {
        if (cluePayload == this.payload) return;
        const clueBounds = cluePayload.getBounds();
        const x = i + minX;
        let intersect = true;
        intersect &&= clueBounds.left - pad < x;
        intersect &&= x < clueBounds.right + pad;
        const pileHeight = bounds.bottom - clueBounds.bottom;
        xs[i] += (intersect ? 1 : 0) * pileHeight;
      });
    });

    const boxWidth = Math.ceil(this.payload.displayWidth);
    const boxPosScores = Array(xCount - boxWidth).fill(0);

    boxPosScores.forEach((_, i, ps) => {
      ps[i] = xScores.slice(i, i + boxWidth).reduce((a, b) => a + b, 0);
    });

    const bestBoxPos = boxPosScores.indexOf(Math.min(...boxPosScores));

    return bounds.left + 0.5 * this.payload.displayWidth + bestBoxPos;
  }

  delete() {
    this.fadeOut(() => {
      this.payload.delete();
    });
  }

  fadeIn(onComplete?: Phaser.Types.Tweens.TweenOnCompleteCallback) {
    this.scene.tweens.add({
      targets: this.payload,
      alpha: 1,
      ease: "Linear",
      delay: 0,
      duration: 100,
      onComplete: onComplete,
    });
  }

  fadeOut(onComplete?: Phaser.Types.Tweens.TweenOnCompleteCallback) {
    this.scene.tweens.add({
      targets: this.payload,
      alpha: 0,
      ease: "Linear",
      delay: 0,
      duration: 100,
      onComplete: onComplete,
    });
  }

  uncover() {
    this.payload.clearTint();
  }

  conceal() {
    this.payload.setTintFill(CONCEAL_TINT);
  }
}

export default Clue;
