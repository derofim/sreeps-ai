/**
 * @file Harvester screep.
 * @author Denis Trofimov
 */

"use strict";

var baseCreep = require('./creep_base');
var gameMemory = require('./gameMemory');
var gameCache = require('./gameCache');
var utils = require('./utils');

var harvester = Object.create(baseCreep);
harvester.run = action;
harvester.role = ROLE_HARVESTER;

module.exports = harvester;

// ToDo:
// droped resources cache
// path cache
// flow class
// flow path length limit
// task queue

var TASK_FIND = 1, // trying to find job
	TASK_DONE = 2, // trying to finish work
	TASK_WORK = 3, // trying to work
	TASK_MOVE = 4, // trying to move to work
	TASK_HIDE = 5; // trying hide from enemy

function onCreated(creep) {
	if (creep.memory.created) return true;
	creep.memory.created = true;
	var source = detectRoomSource(creep, true);
	var spawn = detectRoomSpawn(creep, true);
	pushTask(creep, TASK_FIND);
	return false;
}

function action(creep) {
	if (!onCreated(creep)) return false;
	if (!creep || creep.spawning) return false;
	if (creep.carry.energy < creep.carryCapacity) {
		getEnergy(creep);
	} else {
		storeEnergy(creep);

	}
	return true;
}

function getEnergy(creep) {
	var from = null;
	var source = detectRoomSource(creep, true);
	creep.memory.target_id = source.id;
	from = Game.getObjectById(creep.memory.spawn_id);
	if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
		moveByFlow(creep, from, source);
	}
}

function storeEnergy(creep) {
	var from = null;
	var spawn = detectRoomSpawn(creep, true);
	creep.memory.target_id = spawn.id;
	from = Game.getObjectById(creep.memory.source_id);
	if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
		moveByFlow(creep, from, spawn);
	}
}

function pushTask(creep, action) {
	creep.memory.taskQue = creep.memory.taskQue || [];
	creep.memory.taskQue.push(action);
}

function popTask(creep) {
	creep.memory.taskQue = creep.memory.taskQue || [];
	return creep.memory.taskQue.pop();
}

function setTask(creep, action) {
	creep.memory.task = action;
}

function getTask(creep) {
	return creep.memory.task;
}

/**
 * Try to use flow of directions.
 */
function moveByFlow(creep, from, to) {
	if (creep.fatigue > 0 && creep.carry.energy <= 0) return;
	var flowKey = gameMemory.getCompoundKey(to, from);
	var flow = gameMemory.getFlow(creep.room.name, flowKey); // utils.log(JSON.stringify(flow));
	var dir = gameMemory.getFlowDir(creep.pos, creep.room.name, flowKey); // utils.log(JSON.stringify(flow.flow) + "dir " + dir);
	if (dir == ERR_NOT_IN_POS) {
		creep.moveTo(flow.flowStartPos.x, flow.flowStartPos.y); // ToDo!!!
		console.log(flow.flowSize + " moveTo!" + flow.flowStartPos.x + " " + flow.flowStartPos.y);
	} else {
		flowStep(creep, from, to, dir);
	}
}

/**
 * ToDo.
 */
function flowStep(creep, from, to, dir) {
	var nextTile = gameMemory.nextTile(creep.pos, dir);
	var nextCreeps = creep.room.lookForAt('creep', nextTile.x, nextTile.y); //utils.logJSON(nextTile, " creep.pos ", creep.pos, " nextCreeps ", nextCreeps);
	// Detect next creep
	var betterCreep, weakerCreep, nextCreep;
	for (var name in nextCreeps) {
		if (nextCreeps[name].spawning || nextCreeps[name].memory.role != ROLE_HARVESTER) continue;
		if (nextCreeps[name].getActiveBodyparts(WORK) > creep.getActiveBodyparts(WORK)) {
			betterCreep = nextCreeps[name];
		}
		if (nextCreeps[name].getActiveBodyparts(WORK) < creep.getActiveBodyparts(WORK)) {
			weakerCreep = nextCreeps[name];
		}
		if (nextCreeps[name].getActiveBodyparts(CARRY) > 0) {
			nextCreep = nextCreeps[name];
		}
	}
	if (creep.memory.target_id == creep.memory.source_id) {
		if (weakerCreep) {
			utils.log("weakerCreep" + weakerCreep.name);
			creep.moveBy(dir);
			weakerCreep.moveBy(gameMemory.reverseDir(dir));
		} else { // path is clear
			creep.moveBy(dir);
		}
	} else {
		if (nextCreep) { // can pipe resource to nearest creep
			if (!creep.transfer(nextCreep, RESOURCE_ENERGY)) {
				utils.log("Cant transfer energy at " + JSON.stringify(nextTile) + " to creep " + nextCreep.name);
			}
		} else { // path is clear
			creep.moveBy(dir);
		}
	}
}

/**
 * Detect best source in room to harvest.
 * For harvester: saves once.
 */
function detectRoomSource(creep, saveResult) {
	if (creep.memory.source_id && Game.getObjectById(creep.memory.source_id)) return Game.getObjectById(creep.memory.source_id);
	var sources = gameMemory.getRoomSources(creep.room);
	var closest = utils.absClosest(creep.pos.x, creep.pos.y, sources);
	if (!closest) return null;
	if (saveResult) creep.memory.source_id = closest.id;
	return Game.getObjectById(closest.id);
}

/**
 * Detect best spawn in room to store resources.
 * For harvester: saves once until spawn destroy.
 */
function detectRoomSpawn(creep, saveResult) {
	if (creep.memory.spawn_id && Game.getObjectById(creep.memory.spawn_id)) return Game.getObjectById(creep.memory.spawn_id);
	var spawns = utils.getRoomSpawns(creep.room.name);
	var closest = utils.absClosest(creep.pos.x, creep.pos.y, spawns, {
		notFull: true,
	});
	if (!closest) return null;
	if (saveResult) creep.memory.spawn_id = closest.id;
	return Game.getObjectById(closest.id);
}
