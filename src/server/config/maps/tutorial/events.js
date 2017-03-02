module.exports = [{
	name: 'Rodriguez Heist',
	description: `Rodriguez, the Hermit's only chicken companion, has been kidnapped by a band of imps. Who knows what they plan on doing with him.`,

	phases: [{
		type: 'spawnMob',
		spawnRect: {
			x: 69,
			y: 39,
			w: 7,
			h: 6
		},
		mob: [{
			amount: 5,
			name: 'thieving imp',
			level: 5,
			id: 'impthief-$',
			hpMult: 5,
			dmgMult: 1,
			drops: {
				rolls: 0
			}
		}, {
			name: 'imp kingpin',
			level: 8,
			hpMult: 10,
			dmgMult: 2
		}]
	}, {
		type: 'locateMob',
		announce: 'Locate the thieves',
		mobName: 'imp kingpin',
		distance: 5
	}, {
		type: 'eventChain',
		events: [{
			type: 'mobTalk',
			id: 'impthief-1',
			text: `Boss! They're on to us!`,
			delay: 10
		}, {
			type: 'mobTalk',
			id: 'impthief-3',
			text: `They'll take the chicken. We needs it!`,
			delay: 10
		}, {
			type: 'mobTalk',
			id: 'impkingpin',
			text: `They'll never have her, she's ours now! Kill them!`,
			delay: 15
		}]
	}, {
		type: 'giveReward',
		item: {
			name: 'The Moonspoon',
			sprite: [0, 0],
			level: 1
		}
	}]
}];