module.exports = [{
	name: 'Rodriguez Heist',
	description: `Rodriguez, the Hermit's only chicken companion, has been kidnapped by a band of imps. Who knows what they plan on doing with him.`,

	phases: [{
		type: 'spawnMob',
		spawnRect: {
			x: 70,
			y: 40
		},
		mobs: [{
			amount: 4,
			name: 'Thieving Imp',
			attackable: false,
			level: 5,
			cell: 51,
			id: 'impthief-$',
			hpMult: 5,
			dmgMult: 1,
			drops: {
				rolls: 0
			},
			pos: [{
				x: 0,
				y: 0
			}, {
				x: 4,
				y: 0
			}, {
				x: 0,
				y: 4
			}, {
				x: 4,
				y: 4
			}]
		}, {
			name: 'Imp Kingpin',
			level: 8,
			attackable: false,
			cell: 52,
			id: 'imp-kingpin',
			hpMult: 10,
			dmgMult: 2,
			pos: {
				x: 2,
				y: 2
			}
		}, {
			name: 'Rodriguez',
			exists: true,
			pos: {
				x: 3,
				y: 2
			}
		}]
	}, {
		type: 'locateMob',
		announce: 'Locate the thieves',
		mobs: 'imp-kingpin',
		distance: 3
	}, {
		type: 'eventChain',
		config: [{
			type: 'mobTalk',
			id: 'impthief-1',
			text: `Boss! They're onto us!`,
			delay: 10
		}, {
			type: 'mobTalk',
			id: 'impthief-2',
			text: `They'll take the chicken. We needs it!`,
			delay: 10
		}, {
			type: 'mobTalk',
			id: 'imp-kingpin',
			text: `They'll never have her, she's ours now! Kill them!`,
			delay: 10
		}, {
			type: 'addComponents',
			mobs: ['impthief-0', 'impthief-1', 'impthief-2', 'impthief-3'],
			components: [{
				type: 'aggro',
				faction: 'forest imps'
			}]
		}]
	}, {
		type: 'killMob',
		mobs: ['impthief-0', 'impthief-1', 'impthief-2', 'impthief-3']
	}, {
		type: 'eventChain',
		config: [{
			type: 'mobTalk',
			id: 'imp-kingpin',
			text: `I have a thousand more imps. Come, I'll finish this now.`,
			delay: 10
		}, {
			type: 'addComponents',
			mobs: 'imp-kingpin',
			components: [{
				type: 'aggro',
				faction: 'forest imps'
			}]
		}]
	}, {
		type: 'killMob',
		mobs: 'imp-kingpin',
		percentage: 0.2
	}, {
		type: 'eventChain',
		config: [{
			type: 'mobTalk',
			id: 'imp-kingpin',
			text: `Aargh, no! I must get to my lair!`,
			delay: 10
		}]
	}, {
		type: 'spawnMob',
		mobs: {
			name: 'Imp Kingpin',
			exists: true,
			pos: {
				x: 90,
				y: 25
			}
		}
	}]
}];