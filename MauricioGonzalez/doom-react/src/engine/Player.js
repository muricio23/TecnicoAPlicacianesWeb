export class Player {
    constructor(game) {
        this.game = game;
        this.x = game.map.width / 2;
        this.y = game.map.height / 2;
        this.angle = 0;
        this.walkSpeed = 4;
        this.turnSpeed = 3 * (Math.PI / 180);
        this.turnDirection = 0; // -1 if left, +1 if right
        this.walkDirection = 0; // -1 if back, +1 if front

        this.health = 100;
        this.ammo = 50;
        this.armor = 0;

        this.weaponBobOffset = { x: 0, y: 0 };
        this.bobTimer = 0;
        this.isFiring = false;
        this.fireTimer = 0;
    }

    update() {
        this.angle += this.turnDirection * this.turnSpeed;

        let moveStep = this.walkDirection * this.walkSpeed;

        // Bobbing logic
        if (this.walkDirection !== 0) {
            this.bobTimer += 0.15;
            this.weaponBobOffset.x = Math.cos(this.bobTimer) * 10; // Sway left/right
            this.weaponBobOffset.y = Math.abs(Math.sin(this.bobTimer)) * 10; // Bob up/down
        } else {
            // Return to center slowly
            this.weaponBobOffset.x *= 0.9;
            this.weaponBobOffset.y *= 0.9;
            this.bobTimer = 0;
        }

        // Firing logic
        if (this.isFiring) {
            this.fireTimer++;
            if (this.fireTimer > 15) { // Fire animation duration
                this.isFiring = false;
                this.fireTimer = 0;
            }
        }

        let newX = this.x + Math.cos(this.angle) * moveStep;
        let newY = this.y + Math.sin(this.angle) * moveStep;

        if (!this.game.map.hasWallAt(newX, this.y)) {
            this.x = newX;
        }
        if (!this.game.map.hasWallAt(this.x, newY)) {
            this.y = newY;
        }
    }

    fire() {
        if (!this.isFiring && this.ammo > 0) {
            this.isFiring = true;
            this.ammo -= 1;
            this.fireTimer = 0;
            this.shoot();
        }
    }

    shoot() {
        const sprites = this.game.sprites;

        let closestHit = null;
        let closestDist = Infinity;

        for (let sprite of sprites) {
            if (sprite.isDead) continue;

            const dx = sprite.x - this.x;
            const dy = sprite.y - this.y;
            const dist = Math.hypot(dx, dy);

            // Calculate angle to sprite
            let angleToSprite = Math.atan2(dy, dx);

            // Normalize angles
            let angleDiff = angleToSprite - this.angle;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;

            // Check if aiming at sprite (simple threshold based on distance)
            // Sprite width is roughly tileSize (64).
            // Angular width = atan(32 / dist)
            const threshold = Math.atan(32 / dist);

            if (Math.abs(angleDiff) < threshold) {
                // Potential hit, check for walls
                const rayResult = this.game.raycaster.castRay(angleToSprite);

                if (rayResult.distance > dist) {
                    // No wall blocking
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestHit = sprite;
                    }
                }
            }
        }

        if (closestHit) {
            closestHit.health -= 25; // Damage
            console.log(`Impacto! Enemy Health: ${closestHit.health}`);
            if (closestHit.health <= 0) {
                closestHit.isDead = true;
                console.log("Enemy Dead!");
            }
        }
    }
}
