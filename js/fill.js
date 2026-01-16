// Flood fill algorithm for territory capture
class FloodFill {
    constructor(grid) {
        this.grid = grid;
    }

    // Main capture function - call when player returns to safe zone
    capture(enemies) {
        // Step 1: Mark the trail as temporary walls
        // (already done - trail cells exist)

        // Step 2: Create a visited array
        const visited = this.createVisitedArray();

        // Step 3: Flood fill from each enemy position to mark reachable areas
        for (const enemy of enemies) {
            if (enemy.type === 'basic') {
                const gridPos = this.grid.pixelToGrid(enemy.x, enemy.y);
                this.floodFillFromEnemy(gridPos.x, gridPos.y, visited);
            }
        }

        // Step 4: All unvisited empty cells become claimed
        let cellsClaimed = 0;
        for (let y = 0; y < this.grid.rows; y++) {
            for (let x = 0; x < this.grid.cols; x++) {
                const cell = this.grid.getCell(x, y);
                // If empty and not reachable by enemy, claim it
                if (cell === CONSTANTS.CELL_EMPTY && !visited[y][x]) {
                    this.grid.setCell(x, y, CONSTANTS.CELL_CLAIMED);
                    cellsClaimed++;
                }
            }
        }

        // Step 5: Convert trail to claimed
        this.grid.claimTrail();

        return cellsClaimed;
    }

    createVisitedArray() {
        const visited = [];
        for (let y = 0; y < this.grid.rows; y++) {
            visited[y] = [];
            for (let x = 0; x < this.grid.cols; x++) {
                visited[y][x] = false;
            }
        }
        return visited;
    }

    // BFS flood fill from enemy position
    floodFillFromEnemy(startX, startY, visited) {
        const queue = [[startX, startY]];

        while (queue.length > 0) {
            const [x, y] = queue.shift();

            // Skip if out of bounds
            if (x < 0 || x >= this.grid.cols || y < 0 || y >= this.grid.rows) {
                continue;
            }

            // Skip if already visited
            if (visited[y][x]) {
                continue;
            }

            const cell = this.grid.getCell(x, y);

            // Skip if not empty (borders, claimed, or trail block the fill)
            if (cell !== CONSTANTS.CELL_EMPTY) {
                continue;
            }

            // Mark as visited (reachable by enemy)
            visited[y][x] = true;

            // Add neighbors to queue (4-directional)
            queue.push([x + 1, y]);
            queue.push([x - 1, y]);
            queue.push([x, y + 1]);
            queue.push([x, y - 1]);
        }
    }

    // Check if a capture would be valid (trail forms a closed path)
    isValidCapture(trail) {
        // A valid capture requires at least some trail cells
        // and the player returning to safe zone
        return trail.length > 0;
    }
}
