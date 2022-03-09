let enemies = ["bear", "wolf", "deer", "boar"];
let enemiesSpeed = 50000;

class enemy {
  refData = null;

  constructor(scene) {
    this.scene = scene;
  }

  run(callback) {
    let me = this;
    let randomEnemyType = enemies[Math.floor(Math.random() * 4 + 0)];

    let scale = 2;
    if (randomEnemyType === "deer") {
      scale = 2.5;
    } else if (randomEnemyType === "bear") {
      scale = 3;
    }

    let flag = this.scene.add.sprite(400, 300, `WORD-${this.refData.id}`);
    let enemy = this.scene.physics.add
      .sprite(-100, this.scene.cameras.main.height - 100, randomEnemyType)
      .setScale(scale)
      .setInteractive();

    this.sprite = enemy;

    enemy.typeName = randomEnemyType;
    this.scene.physics.add.collider(enemy, this.scene.ground);
    enemy.flipX = true;

    setAnimation(enemy, enemy.typeName + "_walk");
    // TODO: bring animal below grass

    enemy.movement = this.scene.tweens.add({
      targets: enemy,
      x: this.scene.cameras.main.width + 300,
      duration: enemiesSpeed,
      onComplete: function () {
        enemy.destroy();
        callback(me);
      },
      onStop: function () {},
    });

    // here to implement health
    this.scene.physics.add.overlap(this.scene.player, enemy, (p, nemico) => {
      nemico.disableInteractive();
      nemico.body.enable = false;
      nemico.movement.pause();
      nemico.play(nemico.typeName + "_idle");
      setTimeout(() => {
        nemico.play(nemico.typeName + "_run");
        nemico.movement.stop();
        this.scene.tweens.add({
          targets: nemico,
          x: this.scene.cameras.main.width + 100,
          duration: 2000,
          onComplete: function () {
            nemico.destroy();
            callback(me);
          },
        });
      }, 3000);
    });
  }
}

function setAnimation(obj, idleKey) {
  obj.play({ key: idleKey, repeat: -1 });
}

export default enemy;
