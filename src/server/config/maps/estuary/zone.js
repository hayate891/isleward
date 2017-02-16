module.exports = {
	name: 'estuary',
	level: 20,
	addLevel: 0,
	resources: {},
	mobs: {
		default: {
			faction: 2,
			grantRep: {
				gaekatla: 3
			},

			regular: {
				dmgMult: 8,

				drops: {
					chance: 45,
					rolls: 1,
					magicFind: 70
				}
			}	
		},
		'giant gull': {
			level: 6,
			questItem: {
				name: 'Gull Feather',
				sprite: [0, 0]
			}
		},
		'fanged rabbit': {
			level: 7
		},
		'ghastly toad': {
			level: 8
		},
		'huge flamingo': {
			level: 9,
			questItem: {
				name: 'Gull Feather',
				sprite: [0, 0]
			}
		},
		'overgrown beaver': {
			level: 10
		},
		'ironskull goat': {
			level: 10
		},
		'king gator': {
			level: 12
		},
		"m'ogresh": {
			level: 12,
			isChampion: true,
			grantReputation: {
				gaekatla: 15
			},
			spells: [{
				type: 'melee',
				range: 2,
				animation: 'basic'
			}]
		}
	},
	objects: {
		'exit': {
			components: {
				cpnParticles: {
					simplify: function() {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['48edff', '80f643'],
									end: ['80f643', '48edff']
								},
								scale: {
									start: {
										min: 2,
										max: 10
									},
									end: {
										min: 0,
										max: 2
									}
								},
								speed: {
									start: {
										min: 4,
										max: 16
									},
									end: {
										min: 2,
										max: 8
									}
								},
								lifetime: {
									min: 1,
									max: 4
								},
								randomScale: true,
								randomSpeed: true,
								chance: 0.075,
								randomColor: true,
								spawnType: 'rect',
								spawnRect: {
									x: -32,
									y: -48,
									w: 64,
									h: 64
								}
							}
						}
					}
				}
			}
		}
	}
};