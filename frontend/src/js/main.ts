import * as Phaser from "phaser";

import FightScene from "./fight_scene";

export const GRAVITY_Y = 200;

const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  pixelArt: true,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  scaleMode: Phaser.Scale.FIT,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: GRAVITY_Y },
      // debug: true,
    },
  },
  scene: FightScene,
};

new Phaser.Game(config);

import Keyboard from "simple-keyboard";

document.addEventListener("DOMContentLoaded", () => {
  new Keyboard({
    theme: "hg-theme-default hg-theme-oetzi",
    physicalKeyboardHighlight: true,
    debug: true,
    layout: {
      default: [
        "q w e r t z u i o p \u00FC {bksp}",
        "a s d f g h j k l \u00F6 \u00E4",
        "{space} y x c v b n m \u00DF {enter}",
      ],
    },
    display: {
      "{bksp}": "⟵", // "⌫⟵",
      "{enter}": "↵", // "⏎↩↵⏎",
      "{space}": "␣", // "␣",
    },
    // onChange: console.log,
    // onKeyPress: console.log,
  });
});
