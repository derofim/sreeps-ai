/**
 * @file Base class for all creeps.
 * @author Denis Trofimov
 */

"use strict";

module.exports = {
	role: 'default',
	run: action,
	reset: reset
};

/**
 * Main creep function.
 * Performed on each game tick.
 *
 * @param {Object} creep - Current creep
 * @return Success of action.
 */
function action(creep) {
	console.log("No action set for " + creep.name);
}


/**
 * Reset creep
 */
function reset(creep) {
	console.log("No reset action set for " + creep.name);
}
