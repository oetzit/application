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
    this.clue = new Clue(this.scene, this.beWord);
    this.critter = new Critter(this.scene, this.clue);
    this.scene.foes.push(this);
  }
}

export default Foe;
