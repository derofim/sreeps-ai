/**
 * @file Caches game state to speed up AI.
 * @author Denis Trofimov
 */

"use strict";

var utils = require('./utils');

var bFirstStepCache;
var cache = {
	rooms: {},
};

/**
 * First step, performed each few ticks.
 */
function firstStepCache() {
	if (bFirstStepCache !== undefined) return bFirstStepCache;
	bFirstStepCache = true;
	getRooms();
	// performance measurements
	Memory.lastCacheTime = Memory.lastCacheTime || Game.time;
	var cacheDelay = Game.time - Memory.lastCacheTime;
	//if (cacheDelay) utils.log("Cache refresh delay: " + cacheDelay);
	Memory.lastCacheTime = Game.time;
}

/**
 * Updates room data each few ticks.
 */
function getRooms() {
	var roomName, saveKey, room, spawn;
	// save spawns in each room
	for (var i in Game.spawns) {
		// get data
		spawn = Game.spawns[i];
		saveKey = getCacheKey(Game.spawns[i]);
		roomName = spawn.room.name;
		room = cache.rooms[roomName] || {};
		room.spawns = room.spawns || {};
		// update data
		room.spawns[saveKey] = {
			id: spawn.id,
			x: spawn.pos.x,
			y: spawn.pos.y,
			my: spawn.my,
			name: spawn.name,
		}; // console.log("room " + JSON.stringify(room));
		// save data
		cache.rooms[roomName] = room;
		// saves in memory too for convenience
		spawn.room.memory.spawns = spawn.room.memory.spawns || {};
		spawn.room.memory.spawns[saveKey] = room.spawns[saveKey];
	}
	return cache.rooms;
}

function endTick() { // ToDo!!!
	var roomName, saveKey, room, spawn;
	// clear old data and fire destroyed event
	for (var Rname in cache.rooms) {
		room = cache.rooms[Rname];
		console.log("room " + JSON.stringify(room));
		for (var Sname in room.spawns) {
			spawn = Game.GetObjectById(room.spawns[Sname].id);

			if (!spawn) {
				onSpawnDestroyed(room.spawns[Sname]);
				delete room.spawns[Sname];
			}
		}
	}
}

function onSpawnDestroyed(spawnData) {
	utils.log("Spawn destroyed " + spawnData.name);
}

function getRoomCache(roomName) {
	return cache.rooms[roomName];
}

/**
 * Returns key for static object to save data in cache.
 */
function getCacheKey(object) {
	return object.pos.x + "_" + object.pos.y;
}

/**
 * Init, performed only once.
 */
function cacheInit() {
	// ToDo: use somehow
}

/**
 * Step, performed each tick.
 */
function cacheStep(cacheResult) {
	//utils.log("cacheStep");
	cacheInit();
	firstStepCache();
	// combine results
	var result = cacheResult || {};
	return result;
}

/**
 * Cache static objects
 */
function cacheStatic() {
	//utils.log("cacheStatic");
}

/**
 * Global step,  performed each few ticks.
 */
function stepGlobal() {
	//utils.log("stepGlobal");
	cacheStatic();
}

module.exports = {
	getRooms: getRooms,
	getRoomCache: getRoomCache,
	step: cacheStep,
	stepGlobal: stepGlobal,
};
