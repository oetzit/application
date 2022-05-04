import "phaser";
import FightScene from "./fight_scene";

import * as Types from "../../../backend/src/types";
import { SpriteCluePayload, TextCluePayload } from "./clue_payloads";

const CONCEAL_TINT = 0xaaaaaa;
class Clue {
  scene: FightScene;
  word: Types.Word;
  duration: number;
  payload: SpriteCluePayload | TextCluePayload;

  constructor(scene: FightScene, word: Types.Word, duration: number) {
    this.scene = scene;
    this.word = word;
    this.duration = duration;

    // TODO: is this size really ok?
    const baseHeight = Math.max(this.scene.cameras.main.width * 0.035, 30); // max(3.5vw,32px)
    this.payload =
      Math.random() < 0.5
        ? new TextCluePayload(this.scene, baseHeight)
        : new SpriteCluePayload(this.scene, baseHeight);

    this.payload.once("addedtoscene", this.showTexture.bind(this));
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
