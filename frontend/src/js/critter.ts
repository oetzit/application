import "phaser";
import FightScene from "./fight_scene";

const SPECIES = ["bear", "wolf", "deer", "boar"];
const WALK_VELOCITY = 100;
const FLEE_VELOCITY = -200;
const ESCAPE_VELOCITY = 300;

enum CritterState {
  Moving,
  Escaping,
  Fleeing,
}

class Critter extends Phaser.Physics.Arcade.Sprite {
  state: CritterState;
  scene: FightScene;
  species: string;
  body: Phaser.Physics.Arcade.Body;

  constructor(scene: FightScene) {
    const species = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    super(scene, -100, scene.cameras.main.height - 100, species);
    scene.add.existing(this);

    this.scene = scene;
    this.species = species;

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
    this.body.setVelocity(WALK_VELOCITY, 0);
  }

  flee() {
    this.state = CritterState.Fleeing;
    this.flipX = false;
    this.play({ key: this.species + "_run", repeat: -1 });
    this.body.setVelocity(FLEE_VELOCITY, 0);
  }

  escape() {
    this.state = CritterState.Escaping;
    this.flipX = true;
    this.play({ key: this.species + "_run", repeat: -1 });
    this.body.setVelocity(ESCAPE_VELOCITY, 0);
  }
}

export default Critter;
