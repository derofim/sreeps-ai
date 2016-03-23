/**
 * @file API prototype for creeps.
 * @author Denis Trofimov
 */

"use strict";

var job = require('./jobControl');

/**
 * Efficiently moves creep at target.
 */
Creep.prototype.moveAt = function(target) {
	if (this.fatigue > 0) return this;

	this.moveTo(target);

	return this;
};

/**
 * Efficiently moves creep at direction.
 */
Creep.prototype.moveBy = function(direction) {
	if (this.fatigue > 0) return this;

	this.move(direction);

	return this;
};

/**
 * Main creep task.
 */
Creep.prototype.action = function() {
	job.run(this);
};
