/**
 * @file Helper functions.
 * @author Denis Trofimov
 */

'use strict';

/**
 * Log message. Updates last message in memory.
 *
 * @param {String} msg - Current message
 * @return true if send, else false
 */
function log(msg) {
	if (!msg) return false;

	console.log(msg);

	Memory.lastMessage = msg;

	return true;
}

function logJSON() {
	arguments.toJSON = [].slice;
	return log(JSON.stringify(arguments));
}

/**
 * Log message without repeat. Updates last message in memory.
 *
 * @param {String} msg - Current message
 * @return true if send, else false
 */
function logOnce(msg) {
	var lastMsg = Memory.lastMessage || "";

	if (lastMsg == msg)
		return false;
	else
		log(msg);

	return true;
}

/**
 * Log message with saving game time interval to prevent spamming. Updates last message in memory.
 *
 * @param {String} msg - Current message
 * @param {Number} delay - delay used to stop message spamming < 1024
 * @return true if send, else false
 */
function logDelay(msg, delay) {

	Memory.messages = Memory.messages || {};

	// clear some old messages
	for (var prop in Memory.messages) {
		if (Game.time - Memory.messages[prop].time > 1024) delete Memory.messages[prop];
	}

	// store short msgKey insted of full msg
	var msgKey = msg.substring(0, 30);
	Memory.messages[msgKey] = Memory.messages[msgKey] || {
		time: Game.time
	};

	var diff = Game.time - Memory.messages[msgKey].time;

	// check if we can send msg again
	if (diff < delay && diff !== 0)
		return false;
	else
		log(msg);

	// save new message
	Memory.messages[msgKey] = {
		time: Game.time
	};

	return true;
}

function spawnCost(role, body) {
	var total = 0;
	for (var index in body) {
		var part = body[index];
		switch (part) {
			case MOVE:
				total += 50;
				break;

			case WORK:
				total += 100;
				break;

			case CARRY:
				total += 50;
				break;

			case ATTACK:
				total += 80;
				break;

			case RANGED_ATTACK:
				total += 150;
				break;

			case HEAL:
				total += 250;
				break;

			case CLAIM:
				total += 600;
				break;

			case TOUGH:
				total += 10;
				break;
		}
	}
	return total;
}

function killByRole(role) {
	for (var i in Game.creeps) {
		if (role === undefined || Game.creeps[i].memory.role == role)
			Game.creeps[i].suicide();
	}
}

function absTo(x1, y1, x2, y2) {
	var xd = x2 - x1,
		yd = y2 - y1;
	return xd * xd + yd * yd; // sqrt removed
}

function getRoomSpawns(roomName) {
	//console.log(roomName + " " + JSON.stringify(Memory.rooms[roomName]));
	return Memory.rooms[roomName].spawns;
}

/**
 * Find closest object based on absolute position (object.x, object.y).
 * If specified options than object must have id.
 * Possible options: notFull, notEmpty.
 */
function absClosest(x, y, objects, options) {
	var object, dist, shortest, gameobj, result = null;
	var filter = options || {};
	for (var name in objects) {
		if (!objects[name]) continue;
		object = objects[name];
		gameobj = Game.getObjectById(object.id) || object;
		dist = absTo(x, y, object.x, object.y);
		if (dist < shortest || !shortest) {
			if (filter.notFull && gameobj.energy >= gameobj.energyCapacity) continue;
			if (filter.notEmpty && gameobj.energy <= 0) continue;
			shortest = dist;
			result = object;
		}
	} //if (!result) log("no absClosest result");
	return result;
}

module.exports = {
	log: log,
	logOnce: logOnce,
	logDelay: logDelay,
	killByRole: killByRole,
	spawnCost: spawnCost,
	absTo: absTo,
	absClosest: absClosest,
	getRoomSpawns: getRoomSpawns,
	logJSON: logJSON,
};
