import { Scene, Physics, GameObjects } from "phaser";

const DEFAULT_POS = {
  blocks: [
    {
      x: 600,
      y: 450,
    },
    {
      x: 450,
      y: 350,
    },
    {
      x: 550,
      y: 250,
    },
    {
      x: 200,
      y: 250,
    },
    {
      x: 650,
      y: 150,
    },
  ],
  star: {
    x: 700,
    y: 50,
  },
  dude: {
    x: 100,
    y: 450,
  },
};
export class Test extends Scene {
  platforms: Physics.Arcade.StaticGroup;
  _hasGameStarted: Boolean = false;
  player: Physics.Arcade.Sprite;
  score: number = 60;
  scoreText: GameObjects.Text;
  stars: Physics.Arcade.Group;
  hasMovedInAir: boolean = false;
  timerInterval: any;
  objectPositions: any;

  constructor() {
    super("Test");
    this.objectPositions = DEFAULT_POS;
  }

  preload(): void {
    this.load.plugin(
      "rexmodalplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexmodalplugin.min.js",
      true
    );

    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.image("completionBackground", "assets/blue_panel.png");
    this.load.image("playAgainButton", "assets/green_button.png");
    this.load.spritesheet("dude", "assets/spritesheet.png", {
      frameWidth: 124,
      frameHeight: 201,
    });
  }

  create(): void {
    this.showGameLists();
  }

  update(delta): void {
    if (!this._hasGameStarted) return;
    let cursors = this.input.keyboard.createCursorKeys();
    let isOnGround =
      this.player.body.touching.down || this.player.body.onFloor();

    if (isOnGround) {
      this.hasMovedInAir = false; // This may no longer be needed but kept for reference

      // Ground movement with full control
      if (cursors.left.isDown) {
        this.player.setVelocityX(-180);
        this.player.flipX = false;
        this.player.anims.play("left", true);
      } else if (cursors.right.isDown) {
        this.player.setVelocityX(160);
        this.player.flipX = true;
        this.player.anims.play("left", true);
      } else {
        this.player.setVelocityX(0);
        this.player.anims.play("turn");
      }
    } else {
      // Airborne movement with reduced control
      if (cursors.left.isDown) {
        // Apply a reduced effect of movement
        this.player.setVelocityX(-180 * 0.5); // Adjust the factor to tune control responsiveness
        this.player.anims.play("left", true);
      } else if (cursors.right.isDown) {
        // Apply a reduced effect of movement
        this.player.setVelocityX(160 * 0.5); // Adjust the factor to tune control responsiveness
        this.player.anims.play("right", true);
      }
      // Note: No velocity reset to 0 here to allow continuous but controlled movement in air
    }

    // Jumping logic, same as before
    if (cursors.up.isDown && isOnGround) {
      this.player.setVelocityY(-330); // Adjust jump strength as needed
    }
  }
  startGame() {
    this.add.image(400, 300, "sky");
    this.scoreText = this.add.text(16, 16, "Timer: 60", {
      fontSize: "32px",
      fill: "#000",
    }) as GameObjects.Text;
    this.platforms = this.physics.add.staticGroup();

    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();
    this.objectPositions.blocks.forEach(({ x, y }) => {
      this.platforms.create(x, y, "ground").setScale(0.5).refreshBody();
    });

    this.player = this.physics.add
      .sprite(this.objectPositions.dude.x, this.objectPositions.dude.y, "dude")
      .setScale(0.3) as Physics.Arcade.Sprite;

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.platforms);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 1, end: 2 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 0 }],
      frameRate: 20,
    });

    // this.anims.create({
    //   key: "right",
    //   frames: this.anims.generateFrameNumbers("dude", { start: 4, end: 3 }),
    //   frameRate: 10,
    //   repeat: -1,
    // });

    this.stars = this.physics.add.staticGroup();
    this.stars.create(
      this.objectPositions.star.x,
      this.objectPositions.star.y,
      "star"
    );

    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      undefined,
      this
    );
    this.timerInterval = setInterval(() => {
      this.score -= 1;
      this.scoreText.setText("Timer: " + this.score);
      if (this.score <= 0) {
        clearInterval(this.timerInterval);
        this.showCompletionMessage("Game Over. Time Out");
      }
    }, 1000);
  }

  collectStar(
    player: Physics.Arcade.Sprite,
    star: Physics.Arcade.Sprite
  ): void {
    star.disableBody(true, true);

    // Pause the scene's physics
    this.physics.world.pause();

    // Stop the timer interval
    clearInterval(this.timerInterval);
    this.showCompletionMessage("Congrats. Level Completed");
  }
  showCompletionMessage(msg): void {
    // this.levelComplete = true; // Prevents the completion logic from being triggered multiple times

    // Display the background image
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const completionBackground = this.add.image(
      centerX,
      centerY,
      "completionBackground"
    );
    completionBackground.setDisplaySize(
      this.cameras.main.width * 0.8,
      this.cameras.main.height * 0.5
    ); // Adjust size as needed
    completionBackground.setOrigin(0.5);

    // Display the completion message on top of the background image
    const completionText = this.add
      .text(centerX, centerY, msg, {
        fontSize: "32px",
        fill: "#fff",
        align: "center",
      })
      .setOrigin(0.5);
    // Display the "Play Again" button below the completion text
    const playAgainButton = this.add
      .image(centerX, centerY + 100, "playAgainButton")
      .setOrigin(0.5)
      .setInteractive();

    // Optional: Add text on top of the play again button image if needed
    const playAgainText = this.add
      .text(centerX, centerY + 100, "Play Again", {
        fontSize: "24px",
        fill: "#000",
      })
      .setOrigin(0.5);

    // Click effect: Scale down when pressed
    playAgainButton.on("pointerdown", () => {
      playAgainButton.setScale(0.95); // Scale the button down to 95% of its original size
    });

    // Revert the scale when the pointer is released
    playAgainButton.on("pointerup", () => {
      playAgainButton.setScale(1); // Reset to original scale
      this.score = 60;
      this._hasGameStarted = false;
      this.scene.restart(); // Restart the game
    });

    // Also revert the scale if the pointer exits the button while pressed
    playAgainButton.on("pointerout", () => {
      playAgainButton.setScale(1); // Reset to original scale
    });
  }

  showGameLists() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const completionBackground = this.add.image(
      centerX,
      centerY,
      "completionBackground"
    );
    completionBackground.setDisplaySize(
      this.cameras.main.width * 0.9,
      this.cameras.main.height * 0.8
    );
    completionBackground.setOrigin(0.5);
    this.add
      .text(centerX, 100, `Select Game`, {
        fontSize: "40px",
        fill: "#fff",
        align: "center",
      })
      .setOrigin(0.5);

    let gameList = [
      {
        name: "Game #1",
        data: null,
      },
    ];
    let games: any = localStorage.getItem("games");
    if (!!games) {
      games = JSON.parse(games);

      games.forEach((game, index) => {
        gameList.push({
          name: `Game #${index + 2}`,
          data: game,
        });
      });
    }

    let defaultPos = {
      x: 150,
      y: 150,
    };
    gameList.forEach(({ name, data }, index) => {
      defaultPos.y = defaultPos.y + 28;
      let text = this.add
        .text(defaultPos.x, defaultPos.y, `> ${name}`, {
          fontSize: "14px",
          fill: "#000",
        })
        .setOrigin(0.5)
        .setInteractive();
      text.on("pointerup", () => {
        if (!data) {
          this.objectPositions = DEFAULT_POS;
        } else {
          const starPos = data.find((d) => d.id === "start");
          const dudePos = data.find((d) => d.id === "player");

          let blockObjects = data.filter((obj) => obj.id.startsWith("ground_"));

          this.objectPositions = {
            blocks: blockObjects,
            star: starPos ?? {
              x: 700,
              y: 50,
            },
            dude: dudePos ?? {
              x: 100,
              y: 450,
            },
          };
        }

        this._hasGameStarted = true;
        this.startGame();
      });

      text.on("pointerover", () => {
        text.setStyle({ fontSize: "18px" });
      });

      text.on("pointerout", () => {
        text.setStyle({ fontSize: "14px" });
      });
    });
  }
}
