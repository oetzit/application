import "phaser";
import FightScene from "./fight_scene";

import { GRAVITY_Y } from "./main";
import newtonRaphson from "newton-raphson-method"; // TODO: TS signatures

const SPEED = 450;

class Spear extends Phaser.Physics.Arcade.Sprite {
  source: Phaser.GameObjects.Sprite;
  target: Phaser.GameObjects.Sprite;
  body: Phaser.Physics.Arcade.Body;

  constructor(
    scene: FightScene,
    source: Phaser.GameObjects.Sprite,
    target: Phaser.GameObjects.Sprite,
  ) {
    super(scene, scene.player.x, scene.player.y, "spear");
    scene.add.existing(this);

    this.setScale(3);

    this.source = source;
    this.target = target;

    //scene.physics.world.enableBody(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
    this.body = new Phaser.Physics.Arcade.Body(scene.physics.world, this);
    scene.physics.world.add(this.body);
    scene.physics.add.collider(this, scene.ground);
    this.body.setBounce(0, 0.2); // TODO: bounce only at small angles

    const theta = this.calculateSuccessfulLaunchAngle(source, target);

    if (theta) {
      this.body.setVelocity(SPEED * Math.cos(theta), SPEED * Math.sin(theta));
    } else {
      console.error("Cannot hit foe.");
    }

    scene.physics.add.overlap(this, this.target, (_, hitTarget) => {
      scene.physics.world.removeCollider(this);
      this.destroy();
      hitTarget.flee();
    });

    // this.anims.play("spearAni");
  }

  preUpdate(): void {
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
