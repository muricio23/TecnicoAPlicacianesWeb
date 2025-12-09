import { Map } from "./Map";
import { Player } from "./Player";
import { Raycaster } from "./Raycaster";
import { Sprite } from "./Sprite";

export class Game {
    constructor() {
        this.map = new Map();
        this.player = new Player(this);
        this.raycaster = new Raycaster(this);
        this.wallTexture = new Image();
        this.wallTexture.src = '/wall.png';

        this.weaponIdleTexture = new Image();
        this.weaponIdleTexture.src = '/shotgun_idle.png';
        this.weaponFireTexture = new Image();
        this.weaponFireTexture.src = '/shotgun_fire.png';

        this.sprites = [
            new Sprite(1050, 1050, '/cacodemon.png', 'enemy', '/cacodemon_dea1.png'),
            new Sprite(750, 750, '/cacodemon.png', 'enemy', '/cacodemon_dea1.png'),
            new Sprite(600, 600, '/medkit.png', 'medkit'),
        ];
    }

    update(deltaTime) {
        this.player.update();
        this.moveEnemies(deltaTime);
    }

    moveEnemies(deltaTime) {
        const speed = 100; // Pixels per second (approx 1.5 tiles/sec)
        const minDist = 64; // 1 tile (approx 1 meter)
        const maxDist = 640; // 10 tiles (approx 10 meters)

        for (let sprite of this.sprites) {
            if (sprite.isDead) continue;

            // Only enemies move
            if (sprite.type !== 'enemy') {
                // Check distance for pickup logic below
            }

            const dx = this.player.x - sprite.x;
            const dy = this.player.y - sprite.y;
            const dist = Math.hypot(dx, dy);

            if (sprite.type === 'enemy' && dist > minDist && dist < maxDist) {
                // Normalize direction
                const dirX = dx / dist;
                const dirY = dy / dist;

                const moveX = dirX * speed * deltaTime;
                const moveY = dirY * speed * deltaTime;

                const newX = sprite.x + moveX;
                const newY = sprite.y + moveY;

                // Simple collision detection (check if new position is inside a wall)
                if (!this.map.hasWallAt(newX, sprite.y)) {
                    sprite.x = newX;
                }
                if (!this.map.hasWallAt(sprite.x, newY)) {
                    sprite.y = newY;
                }
            }

            // Attack Logic
            // Attack Logic (Enemies only)
            if (sprite.type === 'enemy') {
                const attackDist = 40; // Approx 0.6 meters
                if (dist < attackDist) {
                    const now = performance.now();
                    if (now - sprite.lastAttackTime > 1000) { // 1 second cooldown
                        this.player.health -= 10;
                        if (this.player.health < 0) this.player.health = 0;
                        sprite.lastAttackTime = now;
                        console.log(`Player hit! Health: ${this.player.health}`);
                    }
                }
            }

            // Pickup Logic
            if (sprite.collectible && !sprite.isCollected) {
                const pickupDist = 32; // Close enough to touch
                if (dist < pickupDist) {
                    if (sprite.type === 'medkit') {
                        if (this.player.health < 100) {
                            this.player.health = Math.min(this.player.health + 25, 100);
                            sprite.isCollected = true;
                            console.log("Picked up Medkit!");
                        }
                    } else if (sprite.type === 'armor') {
                        if (this.player.armor < 100) {
                            this.player.armor = Math.min(this.player.armor + 25, 100);
                            sprite.isCollected = true;
                            console.log("Picked up Armor!");
                        }
                    }
                }
            }
        }

        // Remove collected sprites
        this.sprites = this.sprites.filter(s => !s.isCollected);
    }

    render(ctx, width, height) {
        // Clear screen
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);

        // Render floor and ceiling
        ctx.fillStyle = "#333"; // Ceiling
        ctx.fillRect(0, 0, width, height / 2);
        ctx.fillStyle = "#555"; // Floor
        ctx.fillRect(0, height / 2, width, height / 2);

        // Cast rays
        const rays = this.raycaster.castAllRays();
        const zBuffer = rays.map(r => r.distance); // Extract Z-Buffer

        // Render 3D projection (Walls)
        const wallWidth = width / this.raycaster.numRays;

        if (this.wallTexture && this.wallTexture.complete && this.wallTexture.naturalWidth !== 0) {
            for (let i = 0; i < rays.length; i++) {
                const ray = rays[i];
                const wallHeight = (this.map.tileSize / ray.distance) * 277;

                const textureX = Math.floor(ray.offset * this.wallTexture.width);

                if (ray.isVertical) ctx.globalAlpha = 0.7;
                else ctx.globalAlpha = 1.0;

                ctx.drawImage(
                    this.wallTexture,
                    textureX, 0, 1, this.wallTexture.height,
                    i * wallWidth, (height / 2) - (wallHeight / 2), wallWidth + 1, wallHeight
                );

                ctx.globalAlpha = 1.0;
            }
        } else {
            // Fallback if texture not loaded
            for (let i = 0; i < rays.length; i++) {
                const ray = rays[i];
                const wallHeight = (this.map.tileSize / ray.distance) * 277;

                const color = ray.isVertical ? "#999" : "#aaa";
                ctx.fillStyle = color;
                ctx.fillRect(
                    i * wallWidth,
                    (height / 2) - (wallHeight / 2),
                    wallWidth + 1,
                    wallHeight
                );
            }
        }

        // Render Sprites
        this.renderSprites(ctx, width, height, zBuffer);

        // Render Weapon
        this.renderWeapon(ctx, width, height);
    }

    renderWeapon(ctx, width, height) {
        const weaponTexture = this.player.isFiring ? this.weaponFireTexture : this.weaponIdleTexture;

        if (weaponTexture && weaponTexture.complete) {
            const scale = 1.0; // Reduced scale further
            const w = weaponTexture.width * scale;
            const h = weaponTexture.height * scale;

            const bobX = this.player.weaponBobOffset.x;
            const bobY = this.player.weaponBobOffset.y;

            const x = (width / 4) - (w / 4) + bobX;
            const y = height - h + bobY + 20; // Push it down a bit if needed, or keep at bottom

            ctx.drawImage(weaponTexture, x, y, w, h);
        }
    }

    renderSprites(ctx, width, height, zBuffer) {
        // 1. Calculate distance to player and sort sprites (furthest first)
        for (let sprite of this.sprites) {
            sprite.distance = Math.hypot(this.player.x - sprite.x, this.player.y - sprite.y);
        }
        this.sprites.sort((a, b) => b.distance - a.distance);

        // 2. Project sprites
        for (let sprite of this.sprites) {
            const texture = sprite.isDead ? sprite.deadTexture : sprite.texture;
            if (!texture.complete) continue;

            // Translate sprite position to relative to camera
            const spriteX = sprite.x - this.player.x;
            const spriteY = sprite.y - this.player.y;

            // Transform sprite with the inverse camera matrix
            // [ planeX   dirX ] -1                                       [ dirY      -dirX ]
            // [               ]       =  1/(planeX*dirY-dirX*planeY) *   [                 ]
            // [ planeY   dirY ]                                          [ -planeY  planeX ]

            // Simplified: We assume FOV and plane are derived from angle
            // We need to rotate the sprite position by -playerAngle

            // Using standard rotation matrix for camera space
            // Rotated X (Screen X equivalent in world space relative to camera direction)
            // Rotated Y (Depth)

            // The standard Doom/Wolf3D math uses direction vectors and plane vectors.
            // Since I used angle-based raycasting, I need to adapt.

            // Rotate sprite position by -playerAngle to get it into camera space
            // Camera points along +X axis in my engine? No, let's check Player.js.
            // Player moves with cos(angle), sin(angle). So 0 is Right, PI/2 is Down (canvas coords).

            // Let's rotate the point (spriteX, spriteY) by -player.angle
            const cs = Math.cos(-this.player.angle);
            const sn = Math.sin(-this.player.angle);

            const rotX = spriteX * cs - spriteY * sn; // Relative X (Side)
            const rotY = spriteX * sn + spriteY * cs; // Relative Y (Depth)

            // If sprite is behind player, skip
            if (rotX <= 0) continue; // Wait, if 0 is Right, then X is Depth?

            // Let's re-verify coordinate system.
            // Raycaster: x + cos(angle), y + sin(angle).
            // If angle=0, dx=1, dy=0. Looking Right.
            // So X axis is "Forward" if angle is 0.

            // If I rotate by -angle, then the player's view direction becomes the X axis.
            // So rotX is Depth, rotY is Lateral position.

            if (rotX <= 0) continue; // Behind player

            // Calculate height of the sprite on screen
            // Using same projection constant as walls: 277
            const spriteHeight = Math.abs(height / rotX * 277 / 277 * (this.map.tileSize / 2)); // Scaling factor needs tuning
            // Actually, let's use the exact same formula as walls:
            // wallHeight = (tileSize / distance) * 277
            // Here distance is rotX.

            // Scale sprite based on texture size vs tile size
            const scale = 1.0; // Adjust if sprite is smaller/larger than tile
            const spriteScreenHeight = Math.abs((this.map.tileSize / rotX) * 277) * scale;
            const spriteScreenWidth = spriteScreenHeight; // Square sprites for now

            const spriteTopY = (height - spriteScreenHeight) / 2;

            // Calculate center of sprite on screen
            // Screen X = (0.5 * width) * (1 - rotY / (rotX * tan(FOV/2))) ?
            // Standard formula: ScreenX = (width / 2) * (1 + transformX / transformY)
            // Here transformY is Depth (rotX), transformX is Lateral (rotY).
            // Note: rotY is positive to the "Right" (Down in canvas Y), but screen X goes Left to Right.
            // If rotY is positive (Right relative to player), it should be on the Right of screen.

            // FOV is 60 degrees. tan(30) = 0.577.
            // ScreenX = (width/2) + (rotY / rotX) * (width/2) / tan(FOV/2)
            const k = (width / 2) / Math.tan(this.raycaster.fov / 2);
            const spriteScreenX = (width / 2) + (rotY / rotX) * k; // Plus because rotY positive is Right

            const spriteLeftX = Math.floor(spriteScreenX - spriteScreenWidth / 2);
            const spriteRightX = Math.floor(spriteScreenX + spriteScreenWidth / 2);

            // Draw the sprite in vertical strips
            for (let stripe = spriteLeftX; stripe < spriteRightX; stripe++) {
                if (stripe >= 0 && stripe < width) {
                    // Z-Buffer Check
                    // We need to map screen stripe to ray index
                    // ray index = stripe * (numRays / width)
                    const rayIndex = Math.floor(stripe * (this.raycaster.numRays / width));

                    if (rotX < zBuffer[rayIndex]) {
                        const texX = Math.floor((stripe - spriteLeftX) * texture.width / spriteScreenWidth);

                        ctx.drawImage(
                            texture,
                            texX, 0, 1, texture.height,
                            stripe, spriteTopY, 1, spriteScreenHeight
                        );
                    }
                }
            }
        }
    }
}
