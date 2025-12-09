export class Raycaster {
    constructor(game) {
        this.game = game;
        this.fov = 60 * (Math.PI / 180);
        this.numRays = 640; // Increased resolution
        this.deltaAngle = this.fov / this.numRays;
    }

    castAllRays() {
        let rayAngle = this.game.player.angle - this.fov / 2;
        let rays = [];

        for (let i = 0; i < this.numRays; i++) {
            let ray = this.castRay(rayAngle);
            rays.push(ray);
            rayAngle += this.deltaAngle;
        }
        return rays;
    }

    castRay(rayAngle) {
        // Normalize angle
        rayAngle = rayAngle % (2 * Math.PI);
        if (rayAngle < 0) {
            rayAngle += 2 * Math.PI;
        }

        const ox = this.game.player.x;
        const oy = this.game.player.y;
        const map = this.game.map;

        // Check Horizontals
        let x_hor, y_hor, dx_hor, dy_hor;
        let depth_hor = Infinity;

        const sin_a = Math.sin(rayAngle);
        const cos_a = Math.cos(rayAngle);

        // Horizontal
        if (sin_a > 0) { // Looking down
            y_hor = Math.floor(oy / map.tileSize) * map.tileSize + map.tileSize;
            dy_hor = map.tileSize;
        } else { // Looking up
            y_hor = Math.floor(oy / map.tileSize) * map.tileSize - 0.0001;
            dy_hor = -map.tileSize;
        }

        const tan_a = Math.tan(rayAngle);
        x_hor = ox + (y_hor - oy) / tan_a;
        dx_hor = dy_hor / tan_a;

        while (true) {
            if (map.hasWallAt(x_hor, y_hor)) {
                depth_hor = Math.hypot(x_hor - ox, y_hor - oy);
                break;
            }
            x_hor += dx_hor;
            y_hor += dy_hor;

            // Break if out of bounds to prevent infinite loop
            if (x_hor < 0 || x_hor >= map.width || y_hor < 0 || y_hor >= map.height) {
                break;
            }
        }

        // Check Verticals
        let x_vert, y_vert, dx_vert, dy_vert;
        let depth_vert = Infinity;

        // Vertical
        if (cos_a > 0) { // Looking right
            x_vert = Math.floor(ox / map.tileSize) * map.tileSize + map.tileSize;
            dx_vert = map.tileSize;
        } else { // Looking left
            x_vert = Math.floor(ox / map.tileSize) * map.tileSize - 0.0001;
            dx_vert = -map.tileSize;
        }

        y_vert = oy + (x_vert - ox) * tan_a;
        dy_vert = dx_vert * tan_a;

        while (true) {
            if (map.hasWallAt(x_vert, y_vert)) {
                depth_vert = Math.hypot(x_vert - ox, y_vert - oy);
                break;
            }
            x_vert += dx_vert;
            y_vert += dy_vert;

            // Break if out of bounds
            if (x_vert < 0 || x_vert >= map.width || y_vert < 0 || y_vert >= map.height) {
                break;
            }
        }

        // Compare distances
        let depth, isVertical;
        if (depth_vert < depth_hor) {
            depth = depth_vert;
            isVertical = true;
        } else {
            depth = depth_hor;
            isVertical = false;
        }

        // Remove fish-eye effect
        depth *= Math.cos(this.game.player.angle - rayAngle);

        // Calculate texture offset
        let offset;
        if (isVertical) {
            offset = (y_vert / map.tileSize) % 1;
        } else {
            offset = (x_hor / map.tileSize) % 1;
        }

        return {
            distance: depth,
            angle: rayAngle,
            isVertical: isVertical,
            offset: offset
        };
    }
}
