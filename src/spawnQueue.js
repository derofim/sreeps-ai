/**
 * @file Helper functions.
 * @author Denis Trofimov
 */

'use strict';

// ToDo :
// * queue types:
//  1) try spawn
//  2) wait resources to spawn (to spawn maxed creeps)
// * queue for spawn to control concrete room
// * update queue with creation of new spawn/room

// Que params:
// 1: Require, nothing else can spawn if Que not empty
// 2: Improve, add body parts to maximum
// 3: Multiply, add to que multiple times

function initQueue() {
	if (Memory.spawnQue === undefined) { // Important: LAST added element creates sooner (LIFO)
		// Global queue
		Memory.spawnQue = [];
		// Global priority queue
		Memory.spawnPriorityQue = [];
		// Per spawn queue
		var spawn;
		for (var name in Game.spawns) {
			spawn = Game.spawns[name];
			initSpawnQueue(spawn);
		}
		// Per room queue
		var room;
		for (var rName in Game.rooms) {
			room = Game.rooms[rName];
			initRoomQueue(room);
		}
		addStartingScreeps();
	}
}

function initSpawnQueue(spawn) {
	spawn.memory.spawnQue = [];
	spawn.memory.spawnPriorityQue = [];
}

function initRoomQueue(room) {
	room.memory.spawnQue = [];
	room.memory.spawnPriorityQue = [];
}

function addStartingScreeps() {
	if (Memory.startingScreeps !== undefined) {
		for (var i = Memory.startingScreeps.length - 1; i >= 0; --i) {
			var starting = Memory.startingScreeps[i]; //console.log(starting);
			Memory.spawnQue.push({
				parts: starting.parts,
				roles: {
					role: starting.role
				}
			});
		}
	}
	delete Memory.startingScreeps;
}

module.exports = {
	initQueue: initQueue,
};
