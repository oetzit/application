import "phaser";
import {
  BackgroundImages,
  MusicEffects,
  RexWebFontLoaderConfig,
  RexWebFontLoaderPluginFileConfig,
  SoundEffects,
  SpriteSheets,
} from "./assets";
import TEXT_STYLES from "./text_styles";

export default class LoadingScene extends Phaser.Scene {
  progressBar!: Phaser.GameObjects.Graphics;
  progressBox!: Phaser.GameObjects.Graphics;
  progressTxt!: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: "preload",
      // NOTE: this plugin is loaded in the pack (instead of the preload) because we need to use it in the preload
      pack: { files: [RexWebFontLoaderPluginFileConfig] },
    });
  }

  preload() {
    this.scale.refresh();

    this.progressBox = this.add.graphics();
    this.drawBar(this.progressBox, 0x222222, 1, 8);
    this.progressBar = this.add.graphics();
    this.drawBar(this.progressBox, 0x666666, 0, 0);
    this.progressTxt = this.createProgressTxt();

    this.load.on("progress", this.onLoadProgress.bind(this));
    this.load.on("fileprogress", this.onLoadFileProgress.bind(this));
    this.load.on("complete", this.onLoadComplete.bind(this));

    // @ts-expect-error TODO: addToScene exists but it's private; find a kosher alternative.
    this.plugins.get("rexwebfontloaderplugin").addToScene(this);
    // @ts-expect-error the plugin is loaded but the LoaderPlugin signature isn't extended
    this.load.rexWebFont(RexWebFontLoaderConfig);

    this.load.image(BackgroundImages);
    this.load.spritesheet(SpriteSheets);
    this.load.audio(SoundEffects);
    this.load.audio(MusicEffects);
  }

  drawBar(
    bar: Phaser.GameObjects.Graphics,
    color: number,
    fraction = 1,
    pad = 0,
  ) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    bar.fillStyle(color);
    bar.fillRect(
      w * 0.2 - pad,
      (h - 32 * 2) * 0.5 - pad,
      w * 0.6 * fraction + 2 * pad,
      32 * 2 + 2 * pad,
    );
  }

  createProgressTxt() {
    return this.make.text({
      x: this.cameras.main.width / 2,
      y: this.cameras.main.height / 2,
      origin: 0.5,
      text: "LOADING: 0%",
      style: {
        ...TEXT_STYLES.LOADING,
        testString: "LOADING: 0123456789%",
      },
    });
  }

  onLoadProgress(percentComplete: number) {
    this.setProgressBar(percentComplete);
    this.progressTxt.setText(
      "LOADING: " + (percentComplete * 100).toFixed() + "%",
    );
  }

  onLoadFileProgress(file: Phaser.Loader.File, _percentComplete: number) {
    console.debug("Preloading", file.type, "asset", file.key, "from", file.url);
  }

  onLoadComplete(
    loaderPlugin: Phaser.Loader.LoaderPlugin,
    totalComplete: number,
    totalFailed: number,
  ) {
    console.debug(
      `Assets preloading completed. Succesful: ${totalComplete}. Failed: ${totalFailed}`,
    );
  }

  setProgressBar(fraction: number) {
    this.progressBar.clear();
    this.drawBar(this.progressBar, 0x666666, fraction, 0);
  }

  create() {
    this.scene.start("background");
  }
}
