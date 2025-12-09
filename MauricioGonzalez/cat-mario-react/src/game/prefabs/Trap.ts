import Phaser from 'phaser';

export const TrapType = {
    FakeBlock: 0,
    InvisibleBlock: 1
} as const;

export type TrapType = typeof TrapType[keyof typeof TrapType];

export default class Trap extends Phaser.Physics.Arcade.Sprite {
    private trapType: TrapType;
    private isTriggered: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, type: TrapType) {
        super(scene, x, y, 'trap'); // 'trap' texture key

        this.trapType = type;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setImmovable(true);
        (this.body as Phaser.Physics.Arcade.Body).allowGravity = false;

        this.initTrap();
    }

    private initTrap() {
        switch (this.trapType) {
            case TrapType.FakeBlock:
                // Looks like a normal block
                // Logic handled in collision callback
                break;
            case TrapType.InvisibleBlock:
                this.setVisible(false);
                break;
        }
    }

    public trigger() {
        if (this.isTriggered) return;
        this.isTriggered = true;

        switch (this.trapType) {
            case TrapType.FakeBlock:
                // Maybe it breaks or falls?
                // For now, let's make it non-collidable from bottom
                break;
            case TrapType.InvisibleBlock:
                this.setVisible(true);
                break;
        }
    }
}
