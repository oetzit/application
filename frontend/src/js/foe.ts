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

  constructor(scene: FightScene) {
    this.scene = scene;
  }

  async initialize() {
    this.beWord = (await backend.getWord()).data;
    if (!this.scene.scene.isActive()) return;
    this.beClue = (
      await backend.createClue(this.scene.beGame.id, {
        word_id: this.beWord.id,
        began_at: new Date().toISOString(),
      })
    ).data;

    this.clue = new Clue(this.scene, this.beWord);
    this.critter = new Critter(this.scene);
    this.scene.foes.push(this);

    const overlap = this.scene.physics.add.overlap(
      this.scene.player,
      this.critter,
      () => {
        this.scene.physics.world.removeCollider(overlap);
        this.scene.popFoe(this);
        this.clue.delete();
        this.critter.escape();
        this.scene.updateHealth(-10);
      },
    );
  }

  async handleSuccess() {
    // TODO: update clue
    // TODO: post shot
    // TODO: destroy foe
    this.clue.delete();
  }

  async handleFailure() {
    // TODO: post shot
    // await backend.createShot(this.scene.beGame.id, {
    //   clue_id: this.beClue.id,
    //   began_at: "",
    //   ended_at: new Date().toISOString(),
    //   typed: "",
    //   final: "",
    // });
  }

  destroy() {
    this.clue.destroy();
    this.critter.destroy();
  }
}

export default Foe;
