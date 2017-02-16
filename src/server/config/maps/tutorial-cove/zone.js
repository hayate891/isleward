module.exports = {
	mobs: {
		seagull: {
			level: 1,

			rare: {
				count: 0
			},

			regular: {
				drops: {
					chance: 100,
					rolls: 1,
					noRandom: true,
					blueprints: [{
						name: 'Family Heirloom',
						quality: 2,
						slot: 'neck',
						type: 'Pendant',
						noSalvage: true,
						stats: ['hpMax', 'regenHp', 'regenMana']
					}]
				}
			}
		}
	}
};