import "phaser";
import Clue from "./clue";
import FightScene from "./fight_scene";

const SPECIES = ["bear", "wolf", "deer", "boar"];
const WALK_VELOCITY = 100;
const FLEE_VELOCITY = -200;
const ESCAPE_VELOCITY = 300;

class Critter extends Phaser.Physics.Arcade.Sprite {
  clue: Clue;
  scene: FightScene;
  species: string;
  body: Phaser.Physics.Arcade.Body;

  constructor(scene: FightScene, clue: Clue) {
    const species = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    super(scene, -100, scene.cameras.main.height - 100, species);
    scene.add.existing(this);

    this.scene = scene;
    this.species = species;
    this.clue = clue;

    let scale = 2;
    if (this.species === "deer") {
      scale = 2.5;
    } else if (this.species === "bear") {
      scale = 3;
    }

    this.body = new Phaser.Physics.Arcade.Body(this.scene.physics.world, this);
    this.scene.physics.world.add(this.body);
    this.scene.physics.add.collider(this, this.scene.ground);

    this.setScale(scale);
    // this.setInteractive(true);
    this.flipX = true;

    this.play({ key: this.species + "_walk", repeat: -1 });
    // TODO: bring animal below grass

    this.body.setVelocity(WALK_VELOCITY, 0);

    // here to implement health
    this.scene.physics.add.overlap(
      this.scene.player,
      this,
      (_player, _enemy) => {
        this.play(this.species + "_run");
        this.body.setVelocity(ESCAPE_VELOCITY, 0);
        this.clue.delete();
        setTimeout(() => {
          this.destroy();
        }, 2000);
      },
    );
  }

  flee() {
    this.play(this.species + "_run");
    this.flipX = false;
    this.body.setVelocity(FLEE_VELOCITY, 0);
    setTimeout(() => this.destroy(), 2000); // TODO: disappear offscreen
  }
}

export default Critter;
