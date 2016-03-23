"use strict";

/** Counts empty tiles around a certain positions
 *
 * For now, everything that isn't counted as a wall
 * as in terrain object is counted as free space.
 *
 * @return Number The number of empty tiles
 */
RoomPosition.prototype.countEmptyTilesAround = function() {
	if (this.x < 0 || this.x > 49 || this.y < 0 || this.y > 49)
		return;

	var tiles = Game.rooms[this.roomName].lookAtArea(
		this.y - 1, this.x - 1,
		this.y + 1, this.x + 1
	);
	var spaces = 0;

	if (typeof tiles[this.y - 1] !== "object") tiles[this.y - 1] = {};
	if (typeof tiles[this.y + 1] !== "object") tiles[this.y + 1] = {};

	if (!hasWall(tiles[this.y - 1][this.x - 1])) spaces++;
	if (!hasWall(tiles[this.y - 1][this.x])) spaces++;
	if (!hasWall(tiles[this.y - 1][this.x + 1])) spaces++;
	if (!hasWall(tiles[this.y][this.x - 1])) spaces++;
	if (!hasWall(tiles[this.y][this.x + 1])) spaces++;
	if (!hasWall(tiles[this.y + 1][this.x - 1])) spaces++;
	if (!hasWall(tiles[this.y + 1][this.x])) spaces++;
	if (!hasWall(tiles[this.y + 1][this.x + 1])) spaces++;

	return spaces;
};

function hasWall(list, returnValueDefaultsTrue) {
	if (!Array.isArray(list)) {
		return returnValueDefaultsTrue === undefined ? true : returnValueDefaultsTrue;
	}

	for (var i = 0; i < list.length; i++) {
		if (list[i].type === "terrain" && (
				list[i].terrain === "wall" || list[i].terrain === "lava"
			)) {
			return true;
		}

		if (list[i].type === "structure") {
			switch (list[i].structure.structureType) {
				case STRUCTURE_CONTROLLER:
				case STRUCTURE_EXTENSION:
				case STRUCTURE_KEEPER_LAIR:
				case STRUCTURE_LINK:
				case STRUCTURE_PORTAL:
				case STRUCTURE_WALL:
				case STRUCTURE_STORAGE:
					return true;

				case STRUCTURE_RAMPART:
					if (list[i].structure.my === false) {
						return true;
					}
					break;

				case STRUCTURE_ROAD:
					break;

				default:
					throw Error('hasWall: Unknown structure type ' + list[i].structure.structureType);
			}
		}
	}

	return false;
}
