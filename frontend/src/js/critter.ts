import "phaser";
import FightScene from "./fight_scene";

const SPECIES = ["Bear", "Boar", "Deer", "Fox", "Horse", "Rabbit", "Wolf"];

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
    super(scene, 0, 0, `${species}Walk`);
    scene.add.existing(this);

    this.scene = scene;
    this.species = species;
    this.baseVelocity = baseVelocity;

    this.body = new Phaser.Physics.Arcade.Body(this.scene.physics.world, this);
    this.scene.physics.world.add(this.body);
    this.setCollideWorldBounds(true);

    // NOTE: our sprites widths are in the 52-72 range; average: 62.
    // NOTE: the idea is to fit 5 critters onscreen, tail to tail
    const averageWidth = 62;
    const targetAverageWidth = this.scene.cameras.main.width * 0.2;
    this.setScale(targetAverageWidth / averageWidth);

    // NOTE: just outside the bound and above the ground
    this.setPosition(
      -0.5 * this.displayWidth,
      scene.cameras.main.height - 30 - 0.5 * this.displayHeight,
    );

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
