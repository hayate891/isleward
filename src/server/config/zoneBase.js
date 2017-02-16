define([
	
], function(
	
) {
	return {
		objects: {
			default: {
				
			}
		},
		mobs: {
			default: {
				level: 1,
				faction: 1,
				walkDistance: 1,

				spells: [{
					type: 'melee',
					statMult: 0.1356
				}],

				regular: {
					hpMult: 1,
					dmgMult: 1,

					drops: {
						chance: 35,
						rolls: 1
					}
				},

				rare: {
					count: 1,
					chance: 1,

					hpMult: 1,
					dmgMult: 1,

					drops: {
						chance: 100,
						rolls: 1,
						magicFind: 75
					}
				},

				champion: {
					hpMult: 1,
					dmgMult: 1,

					drops: {
						chance: 100,
						rolls: 2,
						magicFind: 115
					}
				}
			}
		}
	};
});
