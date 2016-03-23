/**
 * @file Provides example of dummy screep.
 * @author Denis Trofimov
 */

"use strict";

var baseCreep = require('./creep_base');

var dummy = Object.create(baseCreep);
dummy.run = action;
dummy.role = 'dummy';

module.exports = dummy;

function action(creep) {
	if (!creep) return false;
	var energy = creep.carry.energy;
	var capacity = creep.carryCapacity;
	// Walk to nearest green flag
	var result_flag = creep.pos.findClosestByPath(FIND_FLAGS, {
		filter: function(object) {
			if (object.color == COLOR_GREEN) return true;
			return null;
		}
	});
	creep.moveAt(result_flag);
	return true;
}
