import "phaser";
import FightScene from "./fight_scene";

class Player extends Phaser.Physics.Arcade.Sprite {
  body: Phaser.Physics.Arcade.Body;

  constructor(scene: FightScene) {
    super(scene, 0, 0, "Oetzi");
    scene.add.existing(this);

    this.setScale(
      // NOTE: this is a magic number related to critter height
      (scene.cameras.main.width * 0.15) / this.displayHeight,
    );
    this.setPosition(
      // NOTE: just outside the bound and above the ground
      scene.cameras.main.width + 0.5 * this.displayWidth,
      scene.cameras.main.height - 30 - 0.5 * this.displayHeight,
    );
    this.flipX = true;
    this.play({ key: "player_run" });

    this.body = new Phaser.Physics.Arcade.Body(scene.physics.world, this);
    scene.physics.world.add(this.body);
    this.setCollideWorldBounds(true);

    scene.tweens.add({
      targets: this,
      x: scene.cameras.main.width - this.displayWidth * 0.5,
      ease: "Power2",
      duration: 1000,
    });
  }

  run() {
    this.play({ key: "player_run", repeat: -1 });
  }

  hitFlash() {
    this.setTintFill(0xcc0000);
    this.scene.time.delayedCall(100, () => this.clearTint());
  }
}

export default Player;
