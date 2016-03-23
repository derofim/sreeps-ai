/**
 * @file Handles state of creeps.
 * @author Denis Trofimov
 */

"use strict";

var utils = require('./utils');
var gameMemory = require('./gameMemory');
var stg = require('./settings');

/**
 *  Handle logic of all creeps, executed each tick.
 */
function creepsStep() {
	//utils.log("creepsStep");
	for (var name in Memory.creeps) {
		if (gameMemory.recycleCreep(name)) {
			// if memory cleaned after dead creep, than refresh creep counter
			// Note: also dont forget to update counter on spawning new creep
			updateCreepCount();
		} else {
			// handle alive creep
			var creep = Game.creeps[name];
			creep.action();
		}
	}
}

/**
 *  Updates my creep counters after creep death and memory clean.
 */
function updateCreepCount() {
	var alive_cnt = 0;
	for (var role in stg.ROLES) {
		saveByRoleInRooms(Game.rooms, role, true);
		alive_cnt += Memory.counters[role];
	}
	Memory.counters.ALIVE = alive_cnt;
}

/**
 *  Updates specified counter based om passed roles.
 *
 * @param {Array} rolesArr - Array of roles
 * @param {String} counterName - Name of Memory.counters element to store count
 */
function updateCreepCountByRoles(rolesArr, counterName) {
	var roles = rolesArr || stg.ROLES;
	// find creeps with passed roles
	var creepsActive = _.pick(Memory.creeps, function(value, key) {
		var creep = Game.creeps[key];
		return _.indexOf(roles, creep.memory.role) != -1 && creep.my && !creep.spawning;
	}); // console.log(JSON.stringify(creepsActive));
	// store count of creeps
	Memory.counters[counterName] = _.size(creepsActive);
}

/**
 * Returns array of spawned creeps from Memory.
 *
 * @param {Array} room_names - Array of room names
 * @param {Number} role - Current role
 * @param {Boolean} my - Current owner
 * @return Creates an object composed of the picked object properties.
 */
function getCreepsInRooms(room_names, role, my) {
	var creeps = _.pick(Memory.creeps, function(value, key) {
		var creep = Game.creeps[key];
		return creep.memory.role == role && _.indexOf(room_names, creep.room.name) != -1 && creep.my == my && !creep.spawning;
	});
	return creeps;
}

/**
 * Save in Memory number of creeps with properties.
 * Example: saveByRoleInRooms([Game.spawns.Spawn1.room], ROLE_DUMMY, true);
 *
 * @param {Array} rooms - Array of rooms
 * @param {Number} role - Current role
 * @param {Boolean} my - Current owner
 * @return Creates an object composed of the picked object properties.
 */
function saveByRoleInRooms(rooms, role, my) {
	//var creepsCount = 0;
	// get array of mapped room names
	var roomNames = _.map(rooms, function(o) {
		return o.name;
	});
	// get size of creeps array
	var creepsCount = _.size(getCreepsInRooms(roomNames, role, my));
	// save in memory
	if (Memory.counters[role] === undefined) Memory.counters[role] = 0;
	Memory.counters[role] = creepsCount; // console.log(creepsCount);

}

module.exports = {
	step: creepsStep,
};
