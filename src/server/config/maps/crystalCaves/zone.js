module.exports = {
	level: 20,
	mobs: {
		snekkety: {
			isChampion: true,
			
			faction: 1,
			level: 10,
			spells: [{
				type: 'trailDash',
				cdMax: 20,
				damage: 10,
				spikeDuration: 10,
				particles: {
					color: {
						start: ['3c3f4c', '929398'],
						end: ['929398', '3c3f4c']
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
							min: 0,
							max: 12
						},
						end: {
							min: 0,
							max: 6
						}
					},
					lifetime: {
						min: 1,
						max: 1
					},
					randomScale: true,
					randomSpeed: true,
					chance: 0.05,
					randomColor: true
				}
			}, {
				type: 'projectile',
				row: 11,
				col: 4,
				cdMax: 7,
				damage: 8,
				range: 10,
				particles: {
					color: {
						start: ['ffeb38', '48edff'],
						end: ['48edff', 'ffeb38']
					},
					lifetime: {
						min: 1,
						max: 1
					},
					randomColor: true,
					chance: 0.075
				}
			}]
		},
		snekkboss: {
			level: 10,
			faction: 1,

			isChampion: true,

			spells: [{
				type: 'slowBlast',
				row: 3,
				col: 4,
				cdMax: 100,
				damage: 20,
				particles: {
					color: {
						start: ['3c3f4c', '929398'],
						end: ['929398', '3c3f4c']
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
							min: 0,
							max: 12
						},
						end: {
							min: 0,
							max: 6
						}
					},
					lifetime: {
						min: 1,
						max: 1
					},
					randomScale: true,
					randomSpeed: true,
					chance: 0.05,
					randomColor: true
				}
			}, {
				type: 'warnBlast',
				row: 3,
				col: 4,
				cdMax: 35,
				damage: 35,
				particles: {
					color: {
						start: ['c0c3cf', '929398'],
						end: ['929398', 'c0c3cf']
					},
					scale: {
						start: {
							min: 4,
							max: 14
						},
						end: {
							min: 2,
							max: 6
						}
					},
					speed: {
						start: {
							min: 2,
							max: 16
						},
						end: {
							min: 0,
							max: 8
						}
					},
					lifetime: {
						min: 1,
						max: 1
					},
					randomScale: true,
					randomSpeed: true,
					chance: 0.075,
					randomColor: true
				}
			}, {
				type: 'projectile',
				animation: 'raiseHead',
				row: 3,
				col: 4,
				cdMax: 30,
				damage: 10,
				range: 100,
				targetRandom: true,
				projectileOffset: {
					x: 1,
					y: -1
				},
				particles: {
					color: {
						start: ['3a71ba', '48edff'],
						end: ['48edff', '3a71ba']
					},
					randomColor: true,
					chance: 0.2
				}
			}, {
				type: 'melee',
				animation: 'raiseHead',
				statType: 'str',
				damage: 6,
				range: 2,
				row: 1,
				col: 4,
				cdMax: 6
			}],

			champion: {
				hpMult: 10,
				dmgMult: 1,

				drops: {
					chance: 100,
					rolls: 2,
					magicFind: 250
				}
			}
		}
	}
};