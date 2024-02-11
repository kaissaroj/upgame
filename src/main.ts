// import { Boot } from "./scenes/Boot";
// import { Game as MainGame } from "./scenes/Game";
// import { GameOver } from "./scenes/GameOver";
// import { MainMenu } from "./scenes/MainMenu";
// import { Preloader } from "./scenes/Preloader";

import { Game, Types } from "phaser";
import { Test } from "./scenes/Test";
import { Home } from "./scenes/Home";
import { AddGame } from "./scenes/AddGame";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  backgroundColor: "#028af8",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 500 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  //   scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
  scene: [Home, Test, AddGame],
};

export default new Game(config);
