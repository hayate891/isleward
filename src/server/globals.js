define([
	'extend',
	'security/connections',
	'misc/helpers',	
	'items/lootRoller',
	'world/atlas',
	'leaderboard/leaderboard'
], function(
	extend,
	cons,
	helpers,
	lootRoller,
	atlas,
	leaderboard
) {
	return {
		init: function() {
			global.extend = extend;
			global.cons = cons;
			global._ = helpers;
			global.lootRoller = lootRoller;
			global.atlas = atlas;
			global.leaderboard = leaderboard;
		}
	};
});