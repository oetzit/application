import "phaser";
import FightScene from "./fight_scene";

const SPECIES = ["bear", "wolf", "deer", "boar"];

enum CritterState {
  Moving,
  Escaping,
  Fleeing,
}

class Critter extends Phaser.Physics.Arcade.Sprite {
  baseVelocity: number;
  state: CritterState;
  scene: FightScene;
  species: string;
  body: Phaser.Physics.Arcade.Body;

  constructor(scene: FightScene, baseVelocity = 100) {
    const species = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    super(scene, 0, 0, species);
    scene.add.existing(this);

    this.scene = scene;
    this.species = species;
    this.baseVelocity = baseVelocity;

    let scale = 2;
    if (this.species === "deer") {
      scale = 2.5;
    } else if (this.species === "bear") {
      scale = 3;
    }

    this.body = new Phaser.Physics.Arcade.Body(this.scene.physics.world, this);
    this.scene.physics.world.add(this.body);
    this.setCollideWorldBounds(true);

    this.setScale(scale);

    this.walk();
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (
      (this.state === CritterState.Escaping && this.isOutsideRightBound()) ||
      (this.state === CritterState.Fleeing && this.isOutsideLeftBound())
    ) {
      this.destroy();
    }
  }

  isOutsideRightBound() {
    return this.x - this.width * 0.5 > this.scene.cameras.main.width;
  }

  isOutsideLeftBound() {
    return this.x + this.width * 0.5 < 0;
  }

  walk() {
    this.state = CritterState.Moving;
    this.flipX = true;
    this.play({ key: this.species + "_walk", repeat: -1 });
    this.body.setVelocity(this.baseVelocity, 0);
  }

  flee() {
    this.state = CritterState.Fleeing;
    this.flipX = false;
    this.play({ key: this.species + "_run", repeat: -1 });
    this.body.setVelocity(-2 * this.baseVelocity, 0);
  }

  escape() {
    this.state = CritterState.Escaping;
    this.flipX = true;
    this.play({ key: this.species + "_run", repeat: -1 });
    this.body.setVelocity(3 * this.baseVelocity, 0);
  }
}

export default Critter;
