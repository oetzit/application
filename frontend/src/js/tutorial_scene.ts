import "phaser";

export default class TutorialScene extends Phaser.Scene {
  constructor() {
    super("tutorial");
  }

  create() {
    this.drawTitle();
    this.bindEvents();
  }

  drawTitle() {
    const p = 20;
    const bounds = new Phaser.Geom.Rectangle(
      p,
      p,
      this.cameras.main.width - 2 * p,
      this.cameras.main.height * 0.8,
    );
    this.add
      .rectangle(bounds.x, bounds.y, bounds.width, bounds.height, 0xff0000, 0.2)
      .setOrigin(0, 0);

    //  |  .  |  .  |  .  |

    const r = bounds.height / bounds.width;
    const perRow = Math.floor(Math.sqrt(30 / r));
    const perCol = Math.ceil(30 / perRow);
    const d = (this.cameras.main.height - 2 * p) / perCol;
    Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜẞ").forEach((letter, index) => {
      this.add
        .text(
          d * ((index % perRow) + 0.5) + p,
          0.7 * d * (Math.floor(index / perRow) + 0.5) + p,
          letter + letter.toLocaleLowerCase(),
          {
            fontFamily: "UnifrakturMaguntia",
            fontSize: `${d * 0.6}px`,
            testString:
              "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜẞabcdefghijklmnopqrstuvwxyzäöüß",
            color: "#ffffff",
            stroke: "black",
            strokeThickness: 4,
          },
        )
        .setOrigin(0.5, 0.5);
      // this.add
      //   .text(
      //     d * ((index % 6) + 0.5) + p,
      //     this.cameras.main.height * 0.5 +
      //       d * (Math.floor(index / 6) + 0.5) +
      //       p,
      //     letter.toLocaleLowerCase(),
      //     {
      //       font: "40px UnifrakturMaguntia",
      //       testString: "Öetzi",
      //       color: "#ffffff",
      //     },
      //   )
      //   .setOrigin(0.5, 0.5);
    });
  }
  drawTitlee() {
    [
      ["Aa", ""],
      ["Bb", ""],
      ["Cc", ""],
      ["Dd", ""],
      ["Ee", ""],
      ["Ff", ""],
      ["Gg", ""],
      ["Hh", ""],
      ["Ii", ""],
      ["Jj", ""],
      ["Kk", ""],
      ["Ll", ""],
      ["Mm", ""],
      ["Nn", ""],
      ["Oo", ""],
      ["Pp", ""],
      ["Qq", ""],
      ["Rr", ""],
      ["Ss", ""],
      ["Tt", ""],
      ["Uu", ""],
      ["Vv", ""],
      ["Zz", ""],
      ["Ää", ""],
      ["Öö", ""],
      ["Üü", ""],
      ["ẞß", ""],
    ].forEach(([l, r], index) => {
      const f = this.add.text(
        120 * Math.floor(index / 6),
        60 * (index % 6),
        l,
        {
          font: "42px UnifrakturMaguntia",
          testString: "Öetzi",
          color: "#ffffff",
        },
      );
      const m = this.add.text(f.getTopRight().x, f.getTopRight().y, l, {
        font: "32px Courier",
        testString: "Öetzi",
        color: "#ffffff",
      });
    });
  }

  bindEvents() {
    this.input.keyboard.once("keyup", this.nextScene.bind(this));
    this.input.once("pointerup", this.nextScene.bind(this));
  }

  nextScene() {
    this.scene.start("fight");
  }
}
