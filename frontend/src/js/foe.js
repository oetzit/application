let SPECIES = ["bear", "wolf", "deer", "boar"];

class Foe {
  constructor(scene, word) {
    this.scene = scene;
    this.scene.foes.push(this);
    this.word = word;
    this.addClue();
    this.addAnimal();
  }

  addClue() {
    this.scene.textures.addBase64(this.word.id, this.word.image);
    this.scene.textures.once(
      "addtexture",
      this.addClueSprite.bind(this),
      this.scene,
    );
  }

  addClueSprite() {
    // TODO: position
    this.clueSprite = this.scene.add.sprite(400, 300, this.word.id);
  }

  addAnimal() {
    this.species = SPECIES[Math.floor(Math.random() * SPECIES.length)];

    let scale = 2;
    if (this.species === "deer") {
      scale = 2.5;
    } else if (this.species === "bear") {
      scale = 3;
    }

    this.animalSprite = this.scene.physics.add
      .sprite(-100, this.scene.cameras.main.height - 100, this.species)
      .setScale(scale)
      .setInteractive();
    this.animalSprite.flipX = true;

    this.scene.physics.add.collider(this.animalSprite, this.scene.ground);

    setAnimation(this.animalSprite, this.species + "_walk");
    // TODO: bring animal below grass

    this.animalSprite.body.setVelocity(100, 0);

    // here to implement health
    this.scene.physics.add.overlap(
      this.scene.player,
      this.animalSprite,
      (player, nemico) => {
        nemico.play(this.species + "_run");
        this.animalSprite.body.setVelocity(300, 0);
        setTimeout(() => nemico.destroy(), 2000);
      },
    );
  }
}

function setAnimation(obj, idleKey) {
  obj.play({ key: idleKey, repeat: -1 });
}

export default Foe;
