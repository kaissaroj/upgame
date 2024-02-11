import { Scene } from "phaser";

export class Home extends Scene {
  constructor() {
    super("Home");
  }
  preload(): void {
    this.load.image("panel", "assets/blue_panel.png");
    this.load.image("button", "assets/green_button.png");
  }
  create(): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const panel = this.add.image(centerX, centerY, "panel");
    panel.setDisplaySize(
      this.cameras.main.width * 0.8,
      this.cameras.main.height * 0.5
    );
    panel.setOrigin(0.5);
    this.add
      .text(centerX, centerY - 50, `Welcome to Game`, {
        fontSize: "40px",
        fill: "#fff",
        align: "center",
      })
      .setOrigin(0.5);

    const playButton = this.add
      .image(centerX, centerY + 50, "button")
      .setOrigin(0.5)
      .setInteractive();

    this.add
      .text(centerX, centerY + 50, "Play", {
        fontSize: "24px",
        fill: "#000",
      })
      .setOrigin(0.5);

    const editButton = this.add
      .image(centerX, centerY + 110, "button")
      .setOrigin(0.5)
      .setInteractive();

    this.add
      .text(centerX, centerY + 110, "Add Game", {
        fontSize: "24px",
        fill: "#000",
      })
      .setOrigin(0.5);

    playButton.on("pointerup", () => {
      this.scene.start("Test");
    });
    editButton.on("pointerup", () => {
      this.scene.start("AddGame");
    });
  }
}
