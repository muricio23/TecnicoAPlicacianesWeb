import Phaser from 'phaser';
import MainScene from './scenes/MainScene';
import GameOverScene from './scenes/GameOverScene';

export const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 1000 },
            debug: true // Set to false in production
        }
    },
    scene: [MainScene, GameOverScene]
};
