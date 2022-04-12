import "phaser";
import Clue from "./clue";
import Critter from "./critter";
import FightScene from "./fight_scene";

import backend from "./backend";
import * as Types from "../../../backend/src/types";

class Foe {
  beWord: Types.Word;
  beClue: Types.Clue;

  scene: FightScene;
  critter: Critter;
  clue: Clue;

  collider: Phaser.Physics.Arcade.Collider;

  duration: number;

  constructor(scene: FightScene, duration = 15) {
    this.scene = scene;
    this.duration = duration;
  }

  async initialize() {
    this.beWord = (await backend.createWordChoice({})).data;
    if (!this.scene.scene.isActive()) return;
    this.beClue = (
      await backend.createClue(this.scene.beGame.id, {
        word_id: this.beWord.id,
        began_at: new Date().toISOString(),
        began_at_gmtm: this.scene.getGameTime(),
      })
    ).data;

    this.clue = new Clue(this.scene, this.beWord);
    // TODO: this is the time to reach a collision w/player, but maybe we should just use the transversal of the full screen.
    const critterSpeed = this.scene.player.getBounds().left / this.duration;
    this.critter = new Critter(this.scene, critterSpeed);
    this.scene.foes.push(this);

    this.collider = this.scene.physics.add.overlap(
      this.scene.player,
      this.critter,
      this.handleCollisionWithPlayer.bind(this),
    );
  }

  handleCollisionWithPlayer() {
        this.scene.sound.play("sfx_hit_player");
    this.scene.physics.world.removeCollider(this.collider);
        this.scene.popFoe(this);
        this.clue.delete();
        this.critter.escape();
        this.scene.player.hitFlash();
        this.scene.updateHealth(-10);
  }

  async handleSuccess() {
    this.clue.delete();
  }

  async handleFailure() {}

  destroy() {
    this.clue.destroy();
    this.critter.destroy();
  }
}

export default Foe;
