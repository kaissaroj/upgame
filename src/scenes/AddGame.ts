import { Physics, Scene } from "phaser";

export class AddGame extends Scene {
  platforms: Physics.Arcade.StaticGroup;
  movableGround: Phaser.GameObjects.Image; // Use GameObjects.Image for non-physics objects
  draggableObjectsPositions: Array<{
    id: string | number;
    x: number;
    y: number;
  }>;

  constructor() {
    super("AddGame");
    this.draggableObjectsPositions = [];
  }
  preload(): void {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");

    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.image("button", "assets/green_button.png");
  }

  create(): void {
    this.add.image(400, 300, "sky");

    const saveButtonText = this.add
      .text(20, 20, "Save", {
        fontSize: "14px",
        fill: "#000",
      })
      .setOrigin(0.5)
      .setInteractive() // Make the text interactive
      .on("pointerup", () => {
        console.log(this.draggableObjectsPositions); // Use console.log or a custom method to handle save

        let games: any = localStorage.getItem("games");
        if (!!games) {
          games = JSON.parse(games);
        } else {
          games = [];
        }
        games.push(this.draggableObjectsPositions);
        localStorage.setItem("games", JSON.stringify(games));
        alert("Game Successfully Saved");
        this.scene.start("Home");
      });

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();

    // Create an array to hold the movable grounds
    const movableGrounds = [];

    // Define positions for the grounds
    const positions = [
      { x: 600, y: 450 },
      { x: 450, y: 350 },
      { x: 550, y: 250 },
      { x: 200, y: 250 },
      { x: 650, y: 150 },
    ];
    // Create 4 movable grounds
    positions.forEach((pos, index) => {
      const ground = this.add
        .image(pos.x, pos.y, "ground")
        .setScale(0.5)
        .setInteractive();
      this.input.setDraggable(ground);
      movableGrounds.push(ground);
      // Assign a unique ID to each ground
      ground.setData("id", `ground_${index}`);
      // Initialize each ground position in the array
      this.draggableObjectsPositions.push({
        id: `ground_${index}`,
        x: pos.x,
        y: pos.y,
      });
    });

    this.star = this.add.image(700, 50, "star").setInteractive();
    this.star.setData("id", `star`);
    this.input.setDraggable(this.star);
    this.draggableObjectsPositions.push({ id: "star", x: 700, y: 50 });

    this.player = this.add.sprite(100, 450, "dude").setInteractive();
    this.player.setData("id", `player`);
    this.input.setDraggable(this.player);
    this.draggableObjectsPositions.push({ id: "player", x: 100, y: 450 });

    // Drag event listeners
    this.input.on("dragstart", (pointer, gameObject) => {
      this.children.bringToTop(gameObject);
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      const mainGroundY = 568; // Y position of the main ground
      const groundHeight = this.platforms.getChildren()[0].displayHeight; // Get the displayed height of the ground
      const playerHalfHeight = gameObject.height / 2; // Half of the player's height to account for the anchor point
      const minY = mainGroundY - groundHeight / 2 - playerHalfHeight; // Calculate the minimum Y position

      //  gameObject.x = Phaser.Math.Clamp(
      //    dragX,
      //    gameObject.width / 2,
      //    this.cameras.main.width - gameObject.width / 2
      //  );
      gameObject.x = Phaser.Math.Clamp(
        dragX,
        0, // From the left edge of the screen
        this.cameras.main.width // To the right edge of the screen
      );

      // Apply specific logic for the player to prevent it from going below the main ground
      if (gameObject.getData("id") === "player") {
        gameObject.y = Phaser.Math.Clamp(
          dragY,
          gameObject.height / 2, // Ensure the player doesn't go above the screen
          minY // Prevent the player from going below the main ground
        );
      } else {
        // For all other objects, keep your original logic
        gameObject.y = Phaser.Math.Clamp(
          dragY,
          gameObject.height / 2,
          this.cameras.main.height - gameObject.height / 2
        );
      }

      // Update logic for storing positions remains the same
      const objectId = gameObject.getData("id");
      const objectToUpdate = this.draggableObjectsPositions.find(
        (obj) => obj.id === objectId
      );
      if (objectToUpdate) {
        objectToUpdate.x = gameObject.x;
        objectToUpdate.y = gameObject.y;
      }
    });
  }

  update(): void {}
}
