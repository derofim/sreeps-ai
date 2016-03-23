/**
 * @file AI settings.
 * @author Denis Trofimov
 */

'use strict';

module.exports = (function() {
	return {
		DEBUG: false,
		ROLES: [ // active roles
			ROLE_BASE,
			ROLE_DUMMY,
			ROLE_HARVESTER,
			ROLE_BUILDER,
			ROLE_GUARD,
			ROLE_RANGED,
			ROLE_HELPER,
			ROLE_SCOUT,
		],
	};
}());
