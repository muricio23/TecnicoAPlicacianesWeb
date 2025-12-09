import Phaser from 'phaser';
import Player from '../prefabs/Player';
import Trap, { TrapType } from '../prefabs/Trap';

export default class MainScene extends Phaser.Scene {
    private player!: Player;
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private traps!: Phaser.Physics.Arcade.Group;

    constructor() {
        super('MainScene');
    }

    preload() {
        this.load.setBaseURL('https://labs.phaser.io');
        this.load.image('sky', 'assets/skies/space3.png');
        this.load.image('ground', 'assets/sprites/platform.png');
        this.load.image('player', 'assets/sprites/phaser-dude.png'); // Placeholder
        this.load.image('trap', 'assets/sprites/crate.png'); // Placeholder
    }

    create() {
        this.add.image(400, 300, 'sky');

        // Platforms
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

        // Player
        this.player = new Player(this, 100, 450);

        // Traps
        this.traps = this.physics.add.group({
            classType: Trap,
            allowGravity: false,
            immovable: true
        });

        // Invisible block trap
        const invisibleTrap = new Trap(this, 300, 400, TrapType.InvisibleBlock);
        this.traps.add(invisibleTrap);

        // Colliders
        this.physics.add.collider(this.player, this.platforms);

        this.physics.add.collider(this.player, this.traps, this.handleTrapCollision, undefined, this);
    }

    update() {
        this.player.update();

        if (this.player.y > 600) {
            this.scene.start('GameOverScene');
        }
    }

    private handleTrapCollision(obj1: any, obj2: any) {
        const player = obj1 as Player;
        const trap = obj2 as Trap;

        // Check collision direction
        if (player.body?.touching.up && trap.body?.touching.down) {
            // Hit from below
            trap.trigger();
        } else {
            // Hit from other sides - maybe die?
            if (trap.visible) {
                // For now, just solid collision
            }
        }

        trap.trigger(); // Trigger anyway for invisible blocks to appear
    }
}
