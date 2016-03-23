/**
 * @file Contains global constants.
 * @author Denis Trofimov
 */

'use strict';

var commands = require('./commands');

module.exports = (function() {
	global._ = require("lodash");
	global.AI = {
		commands: {
			spawnCreep: commands.spawnCreep,
			restart: commands.restart,
		},
	};
	global.AI_VERSION = "0.0.1";
	// creep roles
	global.ROLE_BASE = 0;
	global.ROLE_DUMMY = 1;
	global.ROLE_HARVESTER = 2;
	global.ROLE_BUILDER = 3;
	global.ROLE_GUARD = 4;
	global.ROLE_RANGED = 5;
	global.ROLE_HELPER = 6;
	global.ROLE_SCOUT = 7;
	// flow errors
	global.ERR_NO_FLOW = -1;
	global.ERR_NOT_IN_POS = -2;
}());
