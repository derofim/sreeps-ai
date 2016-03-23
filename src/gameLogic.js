/**
 * @file Handles main game AI logic.
 * @author Denis Trofimov
 */

"use strict";

var utils = require('./utils');
var creepControl = require('./creepControl');

/**
 * Before step, executed each tick.
 */
function preStep(preResult) {
	//utils.log("preStep");
	// performance measurements
	var startCpu = Game.getUsedCpu();

	// combine results
	var result = preResult || {};
	result.CPU = startCpu;
	return result;
}


/**
 * Step, executed each tick.
 */
function logicStep(stepResult) {
	//utils.log("logicStep");
	creepControl.step();

	// combine results
	var result = stepResult || {};
	return result;
}

/**
 * After step, executed each tick.
 */
function postStep(postResult) {
	//utils.log("postStep");

	// performance measurements
	var elapsed = Game.getUsedCpu() - postResult.CPU;
	//if (elapsed) utils.log('Game has used ' + elapsed + ' CPU time');

	// combine results
	var result = postResult || {};
	return result;
}


module.exports = {
	preStep: preStep,
	step: logicStep,
	postStep: postStep,
};
