import "phaser";
import FightScene from "./fight_scene";

import * as Types from "../../../backend/src/types";

interface CluePayload {
  baseHeight: number;
  loadWord: (word: Types.Word) => void;
  delete: () => void;
}

//=[ Text clues ]===============================================================

import { FONTS } from "./assets";

const GERMAN_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜẞ" + "abcdefghijklmnopqrstuvwxyzäöüß";

const TEXT_STYLE: {
  [key: string]: (height: number) => Phaser.Types.GameObjects.Text.TextStyle;
} = {
  TYPEWRITER: (height) => {
    return {
      fontSize: `${height * 1.4}px`,
      fontFamily: FONTS.MONO,
      fontStyle: "bold",
      color: "white",
      stroke: "black",
      strokeThickness: 8,
      testString: GERMAN_ALPHABET,
    };
  },
  TRAINING: (height) => {
    return {
      fontSize: `${height * 1.4}px`,
      fontFamily: FONTS.FRAK,
      color: "white",
      stroke: "black",
      strokeThickness: 8,
      testString: GERMAN_ALPHABET,
    };
  },
  NEWSPAPER: (height) => {
    return {
      fontSize: `${height * 1.4}px`,
      fontFamily: FONTS.FRAK,
      color: "#333333",
      stroke: "#666666",
      strokeThickness: 4,
      testString: GERMAN_ALPHABET,
      backgroundColor: "#aaaaaa",
      padding: { x: 8 },
    };
  },
};

export class TextCluePayload
  extends Phaser.GameObjects.Text
  implements CluePayload
{
  baseHeight: number;

  constructor(scene: FightScene, baseHeight: number) {
    super(scene, 0, 0, "", TEXT_STYLE.TYPEWRITER(baseHeight));
    this.setAlpha(0);
    this.baseHeight = baseHeight;
  }

  loadWord(word: Types.Word) {
    this.setText(word.ocr_transcript);
    this.scene.add.existing(this);
  }

  delete() {
    this.destroy();
  }
}

//=[ Sprite clues ]=============================================================

// const HYPERASCENDERS = /[ÄÖÜ]/;
const ASCENDERS = /[ABCDEFGHIJKLMNOPQRSTUVWXYZbdfhijklstäöüß]/;
const DESCENDERS = /[AFHJPQYZÄfghjpqsyzß]/;

export class SpriteCluePayload
  extends Phaser.GameObjects.Sprite
  implements CluePayload
{
  baseHeight: number;

  constructor(scene: FightScene, baseHeight: number) {
    super(scene, 0, 0, "__MISSING");
    this.setAlpha(0);
    this.baseHeight = baseHeight;
  }

  loadWord(word: Types.Word) {
    // NOTE: this is a throwaway key, we're not leveraging cache
    const textureKey = `${word.id}-${Date.now()}`;
    this.scene.textures.addBase64(textureKey, word.image);
    this.scene.textures.once("addtexture", () => {
      this.setTexture(textureKey);
      this.adjustTextureScale(word);
      this.scene.add.existing(this);
    });
  }

  adjustTextureScale(word: Types.Word) {
    const fullHeight = this.estimateRelativeFullHeight(word) * this.baseHeight;
    const scale = fullHeight / this.texture.getSourceImage().height;
    this.setScale(scale);
  }

  estimateRelativeFullHeight(word: Types.Word) {
    let height = 1.0;
    // if (word.ocr_transcript.match(HYPERASCENDERS)) height += 0.2;
    if (word.ocr_transcript.match(ASCENDERS)) height += 0.2;
    if (word.ocr_transcript.match(DESCENDERS)) height += 0.2;
    return height;
  }

  delete() {
    this.texture.destroy();
    this.destroy();
  }
}
