/**
 * @file Starting point for all systems
 * @author Denis Trofimov
 */

'use strict';

var api = require('./api');
var gameControl = require('./gameControl');
var utils = require('./utils');

gameControl.globalStep();

module.exports.loop = function() {
	var startCpu = Game.getUsedCpu();
	gameControl.gameStep();
	var elapsed = Game.getUsedCpu() - startCpu;
	if (elapsed) utils.log('Game has used ' + elapsed + ' CPU time');
};
