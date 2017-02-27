define([
	'server/mocks/generator'
], function(
	mocks
) {
	return {
		//Is our reputation the correct amount before and after adding
		getReputation_GetReputation: function() {
			var factionBase = require('../src/server/config/factionBase');
			var fjolgard = require('../src/server/config/factions/fjolgard');
			var factionBlueprint = extend(true, {}, factionBase, fjolgard);

			var player = mocks.player({
				reputation: {
					factions: {
						fjolgard: factionBlueprint
					},
					list: [{
						id: 'fjolgard',
						rep: 1000,
						tier: 0
					}]
				},
				equipment: {}
			});

			var repBefore = player.reputation.list[0].rep;

			player.reputation.getReputation('fjolgard', 1);
			if (repBefore + 1 != player.reputation.list[0].rep)
				return true;
		},

		//Is our reputation the correct amount before and after adding
		getReputation_LoseReputation: function() {
			var factionBase = require('../src/server/config/factionBase');
			var fjolgard = require('../src/server/config/factions/fjolgard');
			var factionBlueprint = extend(true, {}, factionBase, fjolgard);

			var player = mocks.player({
				reputation: {
					factions: {
						fjolgard: factionBlueprint
					},
					list: [{
						id: 'fjolgard',
						rep: 1000,
						tier: 0
					}]
				},
				equipment: {}
			});

			var repBefore = player.reputation.list[0].rep;

			player.reputation.getReputation('fjolgard', -1);
			if (repBefore - 1 != player.reputation.list[0].rep)
				return true;
		},

		//Do we gain tiers when getting the correct amount of reputation to do so
		calculateTier_GainTier: function() {
			var factionBase = require('../src/server/config/factionBase');
			var fjolgard = require('../src/server/config/factions/fjolgard');
			var factionBlueprint = extend(true, {}, factionBase, fjolgard);

			var player = mocks.player({
				reputation: {
					factions: {
						fjolgard: factionBlueprint
					},
					list: [{
						id: 'fjolgard'
					}]
				},
				equipment: {}
			});

			var f = player.reputation.list[0];
			for (var i = 0; i < factionBlueprint.tiers.length; i++) {
				var tier = factionBlueprint.tiers[i];
				f.tier = i - 1;
				f.rep = tier.rep - 1;

				player.reputation.getReputation('fjolgard', 1);
				if (f.tier != i)
					return true;
			}
		},

		//Do we lose tiers when losing the correct amount of reputation to do so
		calculateTier_LoseTier: function() {
			var factionBase = require('../src/server/config/factionBase');
			var fjolgard = require('../src/server/config/factions/fjolgard');
			var factionBlueprint = extend(true, {}, factionBase, fjolgard);

			var player = mocks.player({
				reputation: {
					factions: {
						fjolgard: factionBlueprint
					},
					list: [{
						id: 'fjolgard'
					}]
				},
				equipment: {}
			});

			var f = player.reputation.list[0];
			for (var i = 1; i < factionBlueprint.tiers.length; i++) {
				var tier = factionBlueprint.tiers[i];
				f.tier = i;
				f.rep = tier.rep;

				player.reputation.getReputation('fjolgard', -1);
				if (f.tier != i - 1)
					return true;
			}
		}
	};
});