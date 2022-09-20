import "phaser";
import MainScene from "./main_scene";

import { SpriteCluePayload, TextCluePayload } from "./clue_payloads";

const CONCEAL_TINT = 0xaaaaaa;
class Clue {
  scene: MainScene;
  duration: number;
  payload: SpriteCluePayload | TextCluePayload;

  constructor(
    scene: MainScene,
    duration: number,
    payload: SpriteCluePayload | TextCluePayload,
  ) {
    this.scene = scene;
    this.duration = duration;
    this.payload = payload;
    this.payload.once("addedtoscene", this.showPayload.bind(this));
  }

  spotlight() {
    const freeze = () => {
      const body = this.payload.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.allowGravity = false;
        body.checkCollision.none = true;
      }
    };
    freeze();
    const bounds = this.scene.uiDimensions.cluesBounds;
    // FIXME: the very first word seems to always be too big
    const scale = Math.min(
      (bounds.width * 0.9) / this.payload.width,
      (bounds.height * 0.9) / this.payload.height,
      2 * this.payload.scale,
    );
    this.payload.depth = 1;
    this.payload.setAlpha(1);
    this.scene.tweens.add({
      alpha: 1,
      scale: scale,
      x: bounds.centerX,
      y: bounds.centerY,
      targets: [this.payload],
      duration: 600,
      ease: "Elastic",
      easeParams: [1.2, 0.8],
      onComplete: freeze.bind(this),
    });
  }

  showPayload() {
    if (!this.scene.scene.isActive()) return;
    // this.scene.physics.add.existing(this.payload);
    this.scene.cluesGroup.add(this.payload);
    // this.spotlight();
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
    const bounds = this.scene.uiDimensions.cluesBounds;
    const children = this.scene.cluesGroup.children as Phaser.Structs.Set<
      Phaser.GameObjects.Text | Phaser.GameObjects.Sprite
    >;
    const x = this.findBestDropPosition(bounds, children);
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
    this.payload.delete();
  }

  fadeDelete() {
    this.fadeOut(() => {
      this.delete();
    });
  }

  fadeIn(onComplete?: Phaser.Types.Tweens.TweenOnCompleteCallback) {
    this.scene.tweens.add({
      targets: this.payload,
      alpha: 0.5,
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
