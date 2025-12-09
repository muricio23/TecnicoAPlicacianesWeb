import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        this.add.text(400, 300, 'GAME OVER', { fontSize: '64px', color: '#ff0000' }).setOrigin(0.5);
        this.add.text(400, 400, 'Click to Restart', { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);

        this.input.on('pointerdown', () => {
            this.scene.start('MainScene');
        });
    }
}
