/**
 * @file Controls basic game actions.
 * @author Denis Trofimov
 */

"use strict";

var gameCache = require('./gameCache');
var gameMemory = require('./gameMemory');
var gameLogic = require('./gameLogic');
var utils = require('./utils');

/**
 * Global game step, executed after few ticks.
 */
function globalStep() {
	gameInit();
	gameMemory.stepGlobal();
	gameCache.stepGlobal();
}

/**
 * Init game, performed only once.
 */
function gameInit() {
	if (gameMemory.init()) return;
	utils.log("╔════════════════════════╗\n║   ♫♪ ► Starting ◄ ♪♫   ║\n║         v." + AI_VERSION + "        ║\n╚════════════════════════╝ ");
}

/**
 * Main game step, executed each tick.
 */
function gameStep() {
	var cacheResult = gameCache.step();
	var preResult = gameLogic.preStep(cacheResult);
	var stepResult = gameLogic.step(preResult);
	var postResult = gameLogic.postStep(stepResult);
}

module.exports = {
	globalStep: globalStep,
	gameStep: gameStep
};
