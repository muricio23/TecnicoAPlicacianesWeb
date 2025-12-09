export class Sprite {
    constructor(x, y, texturePath, type = 'enemy', deadTexturePath = null) {
        this.x = x;
        this.y = y;
        this.type = type; // 'enemy', 'medkit', 'armor'

        this.texture = new Image();
        this.texture.src = texturePath;

        // Enemy specific
        this.deadTexture = new Image();
        if (type === 'enemy') {
            this.deadTexture.src = deadTexturePath || texturePath;
            this.health = 100;
            this.isDead = false;
            this.lastAttackTime = 0;
        } else {
            this.isDead = false; // Items don't die, they get collected
            this.collectible = true;
        }

        this.distance = 0; // Distance to player, for sorting
    }
}
