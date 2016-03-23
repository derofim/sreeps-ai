/**
 * @file Console commands. Save active commands in globalConstants.js file.
 * @author Denis Trofimov
 */

"use strict";

var utils = require('./utils');
var gameMemory = require('./gameMemory');

/**
 * Spawn creep command.
 * Use: AI.commands.spawnCreep([MOVE, WORK, CARRY], null, { role: ROLE_HARVESTER }, "Spawn1" )
 */
function spawnCreep(body, parts, role, spawnName) {
	if (typeof Game.spawns[spawnName].createCreep(body, parts, role) == 'string') return true;
	return false;
}

/**
 * Reset game state.
 * Use: AI.commands.restart( { memory: true, } )
 */
function restart(options) {
	var filter = options || {
		memory: true,
	};
	if (filter.memory) gameMemory.restart();
	return true;
}


module.exports = {
	spawnCreep: spawnCreep,
	restart: restart,
};
