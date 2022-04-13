import "phaser";

const LAYERS_HEIGHT = 793;
const LAYERS = {
  b00: "assets/background_layers/Layer_0011_0.png",
  b01: "assets/background_layers/Layer_0010_1.png",
  b02: "assets/background_layers/Layer_0009_2.png",
  b03: "assets/background_layers/Layer_0008_3.png",
  b04: "assets/background_layers/Layer_0007_Lights.png",
  b05: "assets/background_layers/Layer_0006_4.png",
  b06: "assets/background_layers/Layer_0005_5.png",
  b07: "assets/background_layers/Layer_0004_Lights.png",
  b08: "assets/background_layers/Layer_0003_6.png",
  b09: "assets/background_layers/Layer_0002_7.png",
  b10: "assets/background_layers/Layer_0001_8.png",
  b11: "assets/background_layers/Layer_0000_9.png",
};

export default class BackgroundScene extends Phaser.Scene {
  layers: Phaser.GameObjects.TileSprite[];

  constructor() {
    super("head");
    this.layers = [];
  }

  preload() {
    Object.entries(LAYERS).forEach(([key, path]) => this.load.image(key, path));
  }

  createBackground() {
    const scale = this.cameras.main.height / LAYERS_HEIGHT;
    const width = this.cameras.main.width / scale;
    const height = this.cameras.main.height / scale;
    Object.keys(LAYERS).forEach((textureKey) => {
      const tileSprite = this.add.tileSprite(0, 0, width, height, textureKey);
      tileSprite.setOrigin(0).setScale(scale);
      this.layers.push(tileSprite);
    });
  }

  create() {
    this.createBackground();
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
