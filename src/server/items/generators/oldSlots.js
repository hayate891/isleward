define([

], function(

) {
	return {
		slots: {
			head: {
				extraStats: {
					stat: 'armor',
					mult: 0.3
				}
			},
			neck: {},
			chest: {
				extraStats: {
					stat: 'armor',
					mult: 1
				}
			},
			hands: {
				extraStats: {
					stat: 'armor',
					mult: 0.1
				}
			},
			finger: {},
			waist: {},
			legs: {
				extraStats: {
					stat: 'armor',
					mult: 0.5
				}
			},
			feet: {
				extraStats: {
					stat: 'armor',
					mult: 0.1
				}
			},
			trinket: {},
			twoHanded: {}
		},
		generate: function(item, blueprint) {
			if (blueprint.slot)
				item.slot = blueprint.slot;
			else
				item.slot = _.randomKey(this.slots);

			var extraStats = this.slots[item.slot].extraStats;
			if (extraStats) {
				extraStats = extend(true, {}, extraStats);
				if (!(extraStats instanceof Array))
					extraStats = [extraStats];

				blueprint.extraStats = extraStats;
			}
		}
	};
});