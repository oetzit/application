import "phaser";
import FightScene from "./fight_scene";

import { GRAVITY_Y } from "./game";
import newtonRaphson from "newton-raphson-method"; // TODO: TS signatures

const SPEED = 550;

class Spear extends Phaser.Physics.Arcade.Sprite {
  source: Phaser.GameObjects.Sprite;
  target: Phaser.GameObjects.Sprite | undefined;
  body: Phaser.Physics.Arcade.Body;

  constructor(
    scene: FightScene,
    source: Phaser.GameObjects.Sprite,
    target: Phaser.GameObjects.Sprite | undefined,
  ) {
    super(scene, scene.player.x, scene.player.y, "spear");
    this.play({ key: "spearAni", repeat: -1 });
    scene.add.existing(this);

    // NOTE: a spear reaching shoulder height makes sense
    this.setScale((scene.player.displayHeight * 0.8) / this.displayWidth);

    this.source = source;
    this.target = target;

    //scene.physics.world.enableBody(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
    this.body = new Phaser.Physics.Arcade.Body(scene.physics.world, this);
    scene.physics.world.add(this.body);
    this.setCollideWorldBounds(true, 0, 0.2);
    this.body.onWorldBounds = true;
    this.on("hitWorldBounds", this.hitGround.bind(this));
    this.body.setBounce(0, 0.2); // TODO: bounce only at small angles

    if (this.target) {
      this.shootTarget();
    } else {
      this.shootGround();
    }
  }

  shootTarget() {
    const theta = this.calculateSuccessfulLaunchAngle(this.source, this.target);
    if (theta) {
      this.body.setVelocity(SPEED * Math.cos(theta), SPEED * Math.sin(theta));
      this.scene.physics.add.overlap(
        this,
        this.target,
        this.hitTarget.bind(this),
      );
    } else {
      console.error("Cannot hit critter. :(");
    }
  }

  hitTarget() {
    this.scene.physics.world.removeCollider(this);
    this.scene.sound.play("sfx_hit_critter");
    // TODO: bounce?
    this.destroy();
    this.target.flee();
  }

  shootGround() {
    const theta = Math.random() * 2 * Math.PI;
    this.body.setVelocity(SPEED * Math.cos(theta), SPEED * Math.sin(theta));
  }

  hitGround() {
    // this.scene.physics.world.remove(this.body);
    this.body.setEnable(false);
    this.play({ key: "spearHitAni", repeat: -1, frameRate: 48 });
    this.setRotation(this.rotation - Math.PI / 2);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      ease: "Linear",
      delay: 500,
      duration: 1500,
      onComplete: this.destroy.bind(this),
    });
  }

  preUpdate(time, delta): void {
    super.preUpdate(time, delta); // NOTE: this preserves sprite animations
    if (this.body.enable) this.alignToVelocity();
  }

  alignToVelocity() {
    const velocity = this.body.velocity as Phaser.Math.Vector2;
    this.setRotation(velocity.angle());
  }

  calculateSuccessfulLaunchAngle(
    source: Phaser.GameObjects.Sprite,
    target: Phaser.GameObjects.Sprite,
  ): number | undefined {
    const dx = source.x - target.x;
    const dy = source.y - target.y;
    const v = SPEED; // NOTE: this is a MAGIC NUMBER
    const w = target.body.velocity.x;
    const g = GRAVITY_Y;

    // TODO: air drag
    // TODO: damp x velocity on impact

    // NOTE: this is an implicit function to solve numerically for finding launch angle
    const f = (theta: number) =>
      2 * dy * Math.pow(w - v * Math.cos(theta), 2) +
      2 * v * Math.sin(theta) * (w - v * Math.cos(theta)) * dx +
      g * Math.pow(dx, 2);

    // TODO: expand and use analytic derivative for better precision
    const theta = newtonRaphson(f, Math.PI, {
      verbose: true,
      maxIterations: 100,
    });

    return typeof theta == "number" ? theta : undefined;
  }
}

export default Spear;
