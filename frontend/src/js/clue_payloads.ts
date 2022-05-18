import "phaser";

import { Word } from "../../../backend/src/types";

interface CluePayload {
  baseHeight: number;
  loadWord: (word: Word) => void;
  delete: () => void;
}

//=[ Text clues ]===============================================================

import { FONTS } from "./assets";

const GERMAN_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜẞ" + "abcdefghijklmnopqrstuvwxyzäöüß";

export const TEXT_STYLE: {
  [key: string]: Phaser.Types.GameObjects.Text.TextStyle;
} = {
  TYPEWRITER: {
    fontFamily: FONTS.MONO,
    fontStyle: "bold",
    color: "white",
    stroke: "black",
    strokeThickness: 8,
    testString: GERMAN_ALPHABET,
  },
  TRAINING: {
    fontFamily: FONTS.FRAK,
    color: "white",
    stroke: "black",
    strokeThickness: 8,
    testString: GERMAN_ALPHABET,
  },
  MONO_NEWSPAPER: {
    fontFamily: FONTS.MONO,
    color: "#333333",
    stroke: "#666666",
    strokeThickness: 4,
    testString: GERMAN_ALPHABET,
    backgroundColor: "#aaaaaa",
    padding: { x: 8 },
  },
  FRAK_NEWSPAPER: {
    fontFamily: FONTS.FRAK,
    color: "#333333",
    stroke: "#666666",
    strokeThickness: 4,
    testString: GERMAN_ALPHABET,
    backgroundColor: "#aaaaaa",
    padding: { x: 8 },
  },
};

export class TextCluePayload
  extends Phaser.GameObjects.Text
  implements CluePayload
{
  baseHeight: number;
  textStyle = TEXT_STYLE.TYPEWRITER;

  constructor(scene: Phaser.Scene, baseHeight: number) {
    super(scene, 0, 0, "", TextCluePayload.prototype.textStyle);
    this.setFontSize(baseHeight * 1.4);
    this.setAlpha(0);
    this.setOrigin(0.5, 0.5);
    this.baseHeight = baseHeight;
  }

  loadWord(word: { ocr_transcript: string }) {
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

  constructor(scene: Phaser.Scene, baseHeight: number) {
    super(scene, 0, 0, "__MISSING");
    this.setAlpha(0);
    this.baseHeight = baseHeight;
  }

  loadWord(word: { id: string; image: string; ocr_transcript: string }) {
    // NOTE: this is a throwaway key, we're not leveraging cache
    const textureKey = `${word.id}-${Date.now()}`;
    this.scene.textures.addBase64(textureKey, word.image);
    this.scene.textures.once("addtexture", () => {
      this.setTexture(textureKey);
      this.adjustTextureScale(word);
      this.scene.add.existing(this);
    });
  }

  adjustTextureScale(word: { ocr_transcript: string }) {
    const fullHeight = this.estimateRelativeFullHeight(word) * this.baseHeight;
    const scale = fullHeight / this.texture.getSourceImage().height;
    this.setScale(scale);
  }

  estimateRelativeFullHeight(word: { ocr_transcript: string }) {
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
