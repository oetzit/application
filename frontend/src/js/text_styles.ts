import { FONTS } from "./assets";

const TEXT_STYLES: {
  [key: string]: Phaser.Types.GameObjects.Text.TextStyle;
} = {
  BASE: {
    align: "center",
    color: "white",
    fontFamily: FONTS.MONO,
    fontStyle: "bold",
    stroke: "black",
    strokeThickness: 8,
    testString:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890 !?;:,.-()",
  },
  BUTTON: {
    color: "white",
    fontFamily: FONTS.MONO,
    fontSize: "32px",
    fontStyle: "bold",
    stroke: "black",
    strokeThickness: 8,
    testString: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    padding: { x: 8, y: 8 },
  },
  BUTTON_HOVER: {
    stroke: "darkorange",
  },
  CHEATSHEET: {
    color: "#ffffff",
    fontFamily: FONTS.FRAK,
    stroke: "black",
    strokeThickness: 4,
  },
  CLUE_DEFAULT: {
    color: "white",
    fontFamily: FONTS.MONO,
    fontStyle: "bold",
    stroke: "black",
    strokeThickness: 8,
    testString: "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜẞabcdefghijklmnopqrstuvwxyzäöüß",
  },
  CLUE_NEWSPAPER_FRAK: {
    backgroundColor: "#aaaaaa",
    color: "#333333",
    fontFamily: FONTS.FRAK,
    padding: {
      x: 8,
    },
    stroke: "#666666",
    strokeThickness: 4,
    testString: "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜẞabcdefghijklmnopqrstuvwxyzäöüß",
  },
  CLUE_NEWSPAPER_MONO: {
    backgroundColor: "#aaaaaa",
    color: "#333333",
    fontFamily: FONTS.MONO,
    padding: {
      x: 8,
    },
    stroke: "#666666",
    strokeThickness: 4,
    testString: "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜẞabcdefghijklmnopqrstuvwxyzäöüß",
  },
  HUD_INPUT: {
    color: "white",
    fontFamily: FONTS.MONO,
    fontStyle: "bold",
  },
  HUD_STAT: {
    color: "white",
    fontFamily: FONTS.MONO,
    fontStyle: "bold",
    stroke: "black",
    strokeThickness: 4,
  },
  LOADING: {
    color: "white",
    fontFamily: FONTS.MONO,
    fontSize: "32px",
    fontStyle: "bold",
    stroke: "black",
    strokeThickness: 4,
  },
  VERSION_TAG: {
    color: "#888888",
    fontFamily: FONTS.MONO,
    fontSize: "16px",
    fontStyle: "bold",
    testString: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.",
    padding: { x: 8, y: 8 },
  },
};

export const makeButtonHoverable = (text: Phaser.GameObjects.Text) => {
  text
    .setInteractive({ useHandCursor: true })
    .on("pointerover", () =>
      text.setStyle({ stroke: TEXT_STYLES.BUTTON_HOVER.stroke }),
    )
    .on("pointerout", () =>
      text.setStyle({ stroke: TEXT_STYLES.BUTTON.stroke }),
    );
};

export default TEXT_STYLES;
