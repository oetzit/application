import "phaser";
import { BackgroundImages } from "./assets";

const LAYERS_HEIGHT = 793;

// prettier-ignore
const HSL_COLORS = [
  ["#674f9e", "#fbb468"], // 06:00
  ["#ffefd6", "#b8ffc7"], // 09:00
  ["#ffffff", "#ffffff"], // 12:00
  ["#fff9b8", "#b3fa8f"], // 15:00
  ["#def3ff", "#97e095"], // 18:00
  ["#e790ff", "#fd9f7d"], // 21:00
  ["#474095", "#369f62"], // 00:00
  ["#ff1111", "#ff9bc0"], // 03:00
]

const COLORS = HSL_COLORS.map((pair) =>
  pair.map(Phaser.Display.Color.HexStringToColor),
);

export default class BackgroundScene extends Phaser.Scene {
  layers!: Phaser.GameObjects.TileSprite[];
  atmosphere!: Phaser.Tweens.Tween;
  curtain!: Phaser.GameObjects.Rectangle;

  constructor() {
    super("background");
  }

  interpColor(
    source: Phaser.Display.Color,
    target: Phaser.Display.Color,
    t: number,
  ) {
    return Phaser.Display.Color.GetColor(
      source.red + (target.red - source.red) * t,
      source.green + (target.green - source.green) * t,
      source.blue + (target.blue - source.blue) * t,
    );
  }

  createLayers() {
    const scale = this.cameras.main.height / LAYERS_HEIGHT;
    const width = this.cameras.main.width / scale;
    const height = this.cameras.main.height / scale;
    return BackgroundImages.map((config) =>
      this.add
        .tileSprite(0, 0, width, height, config.key)
        .setOrigin(0)
        .setScale(scale)
        .setTint(
          // NOTE: this is a bit lazy but meh.
          this.interpColor(COLORS[0][0], COLORS[0][0], 0),
          this.interpColor(COLORS[0][0], COLORS[0][0], 0),
          this.interpColor(COLORS[0][1], COLORS[0][1], 0),
          this.interpColor(COLORS[0][1], COLORS[0][1], 0),
        ),
    );
  }

  createAtmosphere() {
    return this.tweens.addCounter({
      paused: true,
      from: 0,
      to: 255 * (COLORS.length - 1),
      duration: 15 * 60 * 1000, // 3000 * (COLORS.length - 1),
      onUpdate: (tween) => {
        const value = (tween.getValue() % 256) / 256;
        const i = Math.floor(tween.getValue() / 256);
        const f = (i + 1) % COLORS.length;
        const topCol = this.interpColor(COLORS[i][0], COLORS[f][0], value);
        const botCol = this.interpColor(COLORS[i][1], COLORS[f][1], value);
        this.layers.forEach((layer) =>
          layer.setTint(topCol, topCol, botCol, botCol),
        );
      },
    });
  }

  createCurtain() {
    return this.add
      .rectangle(
        0,
        0,
        this.cameras.main.displayWidth,
        this.cameras.main.displayHeight,
        0x000000,
        1,
      )
      .setAlpha(0)
      .setOrigin(0, 0);
  }

  dropCurtain() {
    this.tweens.add({
      targets: this.curtain,
      alpha: 1,
      ease: "Linear",
      delay: 0,
      duration: 200,
    });
  }

  liftCurtain() {
    this.tweens.add({
      targets: this.curtain,
      alpha: 0,
      ease: "Linear",
      delay: 0,
      duration: 200,
    });
  }

  create() {
    this.layers = this.createLayers();
    this.atmosphere = this.createAtmosphere();
    this.curtain = this.createCurtain();
    // this.scale.displaySize.setAspectRatio(
    //   this.cameras.main.width / this.cameras.main.height,
    // );
    this.scale.refresh();
    this.scene.launch("welcome");
  }

  update() {
    this.layers.forEach((layer, index) => {
      layer.tilePositionX -= 0.02 * index;
    });
  }
}
