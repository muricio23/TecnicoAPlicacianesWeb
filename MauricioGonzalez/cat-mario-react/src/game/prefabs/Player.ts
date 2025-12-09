import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player'); // 'player' texture key

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        this.setGravityY(1000);

        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
        }
    }

    update() {
        if (!this.cursors) return;

        if (this.cursors.left.isDown) {
            this.setVelocityX(-160);
            this.setFlipX(true);
            // this.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.setVelocityX(160);
            this.setFlipX(false);
            // this.anims.play('right', true);
        } else {
            this.setVelocityX(0);
            // this.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.body?.touching.down) {
            this.setVelocityY(-500);
        }
    }
}
