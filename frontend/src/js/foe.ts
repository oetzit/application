import "phaser";
import Clue from "./clue";
import Critter from "./critter";
import FightScene from "./fight_scene";

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

  initialize(length: number, beWord: Types.Word, beClue: Types.Clue) {
    this.beWord = beWord;
    this.beClue = beClue;

    this.clue = new Clue(this.scene, this.beWord, this.duration);
    // TODO: this is the time to reach a collision w/player, but maybe we should just use the transversal of the full screen.
    const critterSpeed = this.scene.player.getBounds().left / this.duration;
    this.critter = new Critter(
      this.scene,
      critterSpeed,
      Math.min((length - 1) / 14, 1),
    );
    this.scene.foes.push(this);

    this.collider = this.scene.physics.add.overlap(
      this.scene.player,
      this.critter,
      this.handleCollisionWithPlayer.bind(this),
    );
  }

  handleCollisionWithPlayer() {
    if (navigator.vibrate) navigator.vibrate([60, 30, 120, 30, 180]);
    this.scene.sound.play("sfx_hit_player");
    this.scene.physics.world.removeCollider(this.collider);
    this.scene.popFoe(this);
    this.clue.delete();
    this.critter.escape();
    this.scene.player.hitFlash();
    this.scene.updateHealth(-this.beWord.ocr_transcript.length);
  }

  async handleSuccess() {
    if (navigator.vibrate) navigator.vibrate([30, 60, 30]);
    this.clue.delete();
  }

  async handleFailure() {
    if (navigator.vibrate) navigator.vibrate([30 + 60 + 30]);
  }

  destroy() {
    this.clue.delete();
    this.critter.destroy();
  }
}

export default Foe;
