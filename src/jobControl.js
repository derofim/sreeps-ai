/**
 * @file Creep task handler.
 * @author Denis Trofimov
 */

'use strict';

var base = require('./creep_base');
var dummy = require('./creep_dummy');
var harvester = require('./creep_harvester');

function handleTask(creep) {
	var role = handleRole(creep);
	role.run(creep);
}

function handleRole(creep) {
	switch (creep.memory.role) {
		case ROLE_DUMMY:
			return dummy;
		case ROLE_HARVESTER:
			return harvester;
		case ROLE_BUILDER:
			return dummy;
		case ROLE_GUARD:
			return dummy;
		case ROLE_RANGED:
			return dummy;
		case ROLE_HELPER:
			return dummy;
		case ROLE_SCOUT:
			return dummy;
		default:
			return base;
	}
}

module.exports = {
	run: handleTask,
};
