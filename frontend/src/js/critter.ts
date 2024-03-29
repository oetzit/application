import "phaser";
import MainScene from "./main_scene";

const SPECIES = [
  // NOTE: these are ordered by size (i.e. difficulty)
  "Rabbit",
  "Fox",
  "Boar",
  "Wolf",
  "Horse",
  "Bear",
  "Deer",
];
const RELATIVE_SCALE_ADJUSTMENT: { [key: string]: number } = {
  // Magic numbers yay!
  Bear: 1.0 * 2.5,
  Boar: 0.6 * 2.5,
  Deer: 1.0 * 2.5,
  Fox: 0.6 * 2.5,
  Horse: 1.2 * 2.5,
  Rabbit: 0.5 * 2.5,
  Wolf: 0.7 * 2.5,
};

enum CritterState {
  Initialized,
  Moving,
  Escaping,
  Fleeing,
}

class Critter extends Phaser.Physics.Arcade.Sprite {
  baseVelocity: number;
  state = CritterState.Initialized;
  scene: MainScene;
  species: string;
  body: Phaser.Physics.Arcade.Body;

  constructor(scene: MainScene, baseVelocity = 100, size = 1.0) {
    const speciesIndex = Math.min(
      SPECIES.length - 1,
      Math.floor(size * SPECIES.length),
    );
    const species = SPECIES[speciesIndex];
    super(scene, 0, 0, `${species}Walk`);
    scene.add.existing(this);

    this.scene = scene;
    this.species = species;
    this.baseVelocity = baseVelocity;

    this.body = new Phaser.Physics.Arcade.Body(this.scene.physics.world, this);
    this.scene.physics.world.add(this.body);
    this.setCollideWorldBounds(true);

    this.setScale(RELATIVE_SCALE_ADJUSTMENT[this.species]);

    // NOTE: just outside the bound and above the ground
    this.setPosition(
      -0.5 * this.displayWidth,
      scene.cameras.main.height - 30 - 0.5 * this.displayHeight,
    );

    this.walk();
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (
      (this.state === CritterState.Escaping && this.isOutsideRightBound()) ||
      (this.state === CritterState.Fleeing && this.isOutsideLeftBound())
    ) {
      this.destroy();
    }
  }

  isOutsideRightBound() {
    return this.getBounds().left > this.scene.cameras.main.width;
  }

  isOutsideLeftBound() {
    return this.getBounds().right < 0;
  }

  walk() {
    this.state = CritterState.Moving;
    this.flipX = true;
    this.play({ key: this.species + "Walk", repeat: -1 });
    this.body.setVelocity(this.baseVelocity, 0);
  }

  flee() {
    this.state = CritterState.Fleeing;
    this.flipX = false;
    this.play({ key: this.species + "Run", repeat: -1 });
    this.body.setVelocity(-2 * this.baseVelocity, 0);
  }

  escape() {
    this.state = CritterState.Escaping;
    this.flipX = true;
    this.play({ key: this.species + "Run", repeat: -1 });
    this.body.setVelocity(3 * this.baseVelocity, 0);
  }

  hitFlash() {
    this.setTintFill(0xcc0000);
    this.scene.time.delayedCall(100, () => this.clearTint());
  }
}

export default Critter;
