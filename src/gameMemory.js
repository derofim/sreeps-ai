/**
 * @file Saves in memory game state.
 * @author Denis Trofimov
 */

"use strict";

var utils = require('./utils');

/**
 *  Init memory, performed only once.
 */
function memoryInit() {
	if (Memory.init !== undefined) return true;
	Memory.init = true;
	Memory.counters = {
		'CREATED': 0, // total created screeps for all roos and spawns, counts dead too!
		'ALIVE': 0, // total living screeps for all rooms and spawns!
	};
	return false;
}

/**
 * Memorize static objects
 */
function memoryStatic() {
	//utils.log("cacheStatic");
}

/**
 * Global step, performed each few ticks.
 */
function stepGlobal() {
	//utils.log("stepGlobal");
	memoryStatic();
	for (var room_name in Game.rooms) {
		saveRoomObjects(Game.rooms[room_name]);
	}
}


/**
 * Memorise static objects in room, like sources. Performed once per room.
 */
function saveRoomObjects(room) {
	saveRoomSources(room);
	savePathSources(room); // depends on saveRoomSources
}

function savePathSources(room) {
	if (room.memory.source_path) return; // ToDo!!!
	room.memory.source_path = room.memory.source_path || {};
	var i, k, sources, source, path, saveKey, flow, flowStart, intersection;
	// save path from each spawn to each source
	room.memory.uniqueflow = {}; // used to save not repeating flow squares
	for (i in Game.spawns) {
		sources = getRoomSources(room); //console.log("Game.spawns[i] " + JSON.stringify(Game.spawns[i]));
		for (k in sources) {
			source = Game.getObjectById(sources[k].id);
			path = getSourcePaths(room, source.pos, Game.spawns[i].pos);
			if (!path) continue;
			flow = getFlowPathBidirectional(path, source.room.name); //console.log(JSON.stringify(_.size(flow.backward)));
			// save flow to spawn from source
			intersection = _.size(_.intersection(Object.keys(flow.backward), Object.keys(room.memory.uniqueflow)));
			flowStart = nextTile(source.pos, flow.backward[getMemoryKey(source)]);
			room.memory.source_path[getCompoundKey(Game.spawns[i], source)] = {
				flow: flow.backward,
				flowSize: _.size(flow.forward) - intersection - 1,
				maxFlowSize: _.size(flow.forward) - 1,
				startPos: source.pos,
				startID: source.id,
				toID: Game.spawns[i].id, // ToDo: check spawn destroyed
				flowStartPos: flowStart,
			};
			// save flow to source from spawn
			intersection = _.size(_.intersection(Object.keys(flow.forward), Object.keys(room.memory.uniqueflow)));
			flowStart = nextTile(Game.spawns[i].pos, flow.forward[getMemoryKey(Game.spawns[i])]);
			room.memory.source_path[getCompoundKey(source, Game.spawns[i])] = {
				flow: flow.forward,
				flowSize: _.size(flow.forward) - intersection - 1,
				maxFlowSize: _.size(flow.forward) - 1,
				startPos: Game.spawns[i].pos,
				startID: Game.spawns[i].id,
				toID: source.id,
				flowStartPos: flowStart,
			};
			// improvements
			_.extend(room.memory.uniqueflow, flow.forward);
			delete room.memory.uniqueflow[getMemoryKey(Game.spawns[i])];
			//utils.log("forward " + JSON.stringify(flow.forward));
			//utils.log("backward " + JSON.stringify(flow.backward));
			//break;
		}
		//utils.logJSON(room.memory.uniqueflow);
	}
}

function getFlowDir(pos, roomName, flowKey) {
	/*var flowMemory = Game.rooms[roomName].memory.source_path[flowKey];
	if (!flowMemory) return ERR_NO_FLOW;
	var flow = flowMemory.flow;*/
	var flow = getFlow(roomName, flowKey).flow;
	var memKey = getMemoryKeyByPos(pos.x, pos.y);
	var dir = flow[memKey];
	if (!dir) return ERR_NOT_IN_POS;
	return dir;
}

function getFlow(roomName, flowKey) {
	var flowMemory = Game.rooms[roomName].memory.source_path[flowKey];
	if (!flowMemory) return ERR_NO_FLOW;
	return flowMemory;
}

function reverseDir(dir) {
	return (dir + 3) % 8 + 1;
}

function getDirection(x1, y1, x2, y2) {
	var dx = x1 - x2,
		dy = y1 - y2; // console.log(x1 + " " + y1 + " " + x2 + " " + y2);
	// BOTTOM X
	if (dx < 0 && dy < 0) return BOTTOM_LEFT;
	else if (dx > 0 && dy < 0) return BOTTOM_RIGHT;
	// TOP X
	else if (dx < 0 && dy > 0) return TOP_LEFT;
	else if (dx > 0 && dy > 0) return TOP_RIGHT;
	// LEFT/RIGHT
	else if (dx < 0 && dy === 0) return LEFT;
	else if (dx > 0 && dy === 0) return RIGHT;
	// TOP/BOTTOM
	else if (dx === 0 && dy > 0) return TOP;
	else if (dx === 0 && dy < 0) return BOTTOM;
	return -1;
}

function getRoomDirection(x1, y1, x2, y2, roomName) {
	var direction = getDirection(x1, y1, x2, y2); // console.log(roomName + " " + direction);
	return direction;
}

function dirDelta(direction) {
	var result = {
		x: 0,
		y: 0,
	};
	if (direction == TOP) --result.y;
	else if (direction == BOTTOM) ++result.y;
	else if (direction == RIGHT) ++result.x;
	else if (direction == LEFT) --result.x;
	else if (direction == TOP_RIGHT) {
		result.y--;
		result.x++;
	} else if (direction == TOP_LEFT) {
		result.y--;
		result.x--;
	} else if (direction == BOTTOM_RIGHT) {
		result.y++;
		result.x++;
	} else if (direction == BOTTOM_LEFT) {
		result.y++;
		result.x--;
	}
	return result;
}

function debugDir(direction) {
	if (direction == TOP) return "TOP";
	else if (direction == BOTTOM) return "BOTTOM";
	else if (direction == RIGHT) return "RIGHT";
	else if (direction == LEFT) return "LEFT";
	else if (direction == TOP_RIGHT) return "TOP_RIGHT";
	else if (direction == TOP_LEFT) return "TOP_LEFT";
	else if (direction == BOTTOM_RIGHT) return "BOTTOM_RIGHT";
	else if (direction == BOTTOM_LEFT) return "BOTTOM_LEFT";
	return "WTF";
}

function nextTile(p_pos, direction) { // returns position by previous pos and direction to move
	var delta = dirDelta(direction);
	return {
		x: p_pos.x + delta.x,
		y: p_pos.y + delta.y,
	};
}

function getFlowPathBidirectional(path, roomName) {
	var result = {
		forward: {},
		backward: {},
	};
	for (var i in path) {
		// save forward direction
		var dir = reverseDir(path[i].direction);
		result.forward[getMemoryKeyByPos(path[i].x, path[i].y)] = dir;
		// save reverse direction
		var nextPos = nextTile(path[i], dir);
		var backDir = path[i].direction;
		//utils.log(path[i].x + " " + path[i].y + " " + debugDir(dir) + " nextPos " + JSON.stringify(nextPos) + " backDir " + debugDir(backDir)); //utils.log(nextPos.x + " " + nextPos.y + " " + backDir);
		result.backward[getMemoryKeyByPos(nextPos.x, nextPos.y)] = backDir;
	}
	return result;
}

function getSourcePaths(room, from, to) {
	if (!to || !room) return;
	var path = room.findPath(from, to, {
		ignoreCreeps: true,
		ignoreDestructibleStructures: true,
		ignoreRoads: true,
	});
	if (path.length > 15) return null; // max path size
	for (var i in path) {
		var result = room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
	}
	return path;
}

function saveRoomSources(room) {
	if (room.memory.source_data) return;
	room.memory.source_data = room.memory.source_data || {};
	// save source specific data
	var sources = room.find(FIND_SOURCES);
	utils.log("Found " + _.size(sources) + " sources in room " + room.name);
	var source;
	for (var name in sources) {
		source = sources[name];
		room.memory.source_data[getMemoryKey(source)] = {
			id: source.id,
			x: source.pos.x,
			y: source.pos.y,
			emptyTiles: source.pos.countEmptyTilesAround(),
			energyCapacity: source.energyCapacity,
		};
	}
}

/**
 * Returns key for static object to save data in memory.
 */
function getMemoryKey(object) {
	return getMemoryKeyByPos(object.pos.x, object.pos.y);
}

function getMemoryKeyByPos(x, y) {
	return x + "_" + y;
}

function getCompoundKey(a, b) {
	return getMemoryKey(a) + "_" + getMemoryKey(b);
}

/**
 *  Free memory after creep.
 * @return True if creep deleted, else false.
 */
function recycleCreep(name) {
	var creep = Game.creeps[name];
	if (creep === undefined || (creep.spawning === false && creep.memory.role === undefined)) {
		delete Memory.creeps[name];
		return true;
	}
	return false;
}

/**
 * Get all sources from memory.
 */
function getRoomSources(room) {
	//console.log("getRoomSources");
	return room.memory.source_data || {};
}

function restart() {
	delete Memory.spawns;
	delete Memory.rooms;
	delete Memory.counters;
	delete Memory.lastMessage;
	delete Memory.lastCacheTime;
	delete Memory.init;
}

module.exports = {
	init: memoryInit,
	recycleCreep: recycleCreep,
	initialized: Memory.init,
	stepGlobal: stepGlobal,
	getRoomSources: getRoomSources,
	getFlowDir: getFlowDir,
	getMemoryKey: getMemoryKey,
	getMemoryKeyByPos: getMemoryKeyByPos,
	getFlow: getFlow,
	getCompoundKey: getCompoundKey,
	nextTile: nextTile,
	reverseDir: reverseDir,
	restart: restart,
};
