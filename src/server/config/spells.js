define([
	'misc/events'
], function(
	events
) {
	var spells = [{
		name: 'Magic Missile',
		description: 'Launches an orb of unfocussed energy at your target.',
		type: 'projectile',
		icon: [1, 0],
		animation: 'hitStaff',
		particles: {
			color: {
				start: ['7a3ad3', '3fa7dd'],
				end: ['3fa7dd', '7a3ad3']
			},
			scale: {
				start: {
					min: 2,
					max: 14
				},
				end: {
					min: 0,
					max: 8
				}
			},
			lifetime: {
				min: 1,
				max: 3
			},
			alpha: {
				start: 0.7,
				end: 0
			},
			randomScale: true,
			randomColor: true,
			chance: 0.6
		}
	}, {
		name: 'Ice Spear',
		description: 'A jagged projectile of pure ice pierces your target and slows his movement.',
		type: 'iceSpear',
		icon: [1, 1],
		animation: 'hitStaff',
		particles: {
			color: {
				start: ['fcfcfc', '48edff'],
				end: ['48edff', 'fcfcfc']
			},
			scale: {
				start: {
					min: 2,
					max: 12
				},
				end: {
					min: 0,
					max: 6
				}
			},
			lifetime: {
				min: 1,
				max: 4
			},
			alpha: {
				start: 0.8,
				end: 0
			},
			randomScale: true,
			randomColor: true,
			chance: 0.9
		}
	}, {
		name: 'Fireblast',
		description: 'Unleashes a blast of fire that damages and pushes back nearby foes.',
		type: 'fireblast',
		icon: [1, 2],
		animation: 'raiseStaff',
		particles: {
			color: {
				start: ['d43346', 'faac45'],
				end: ['c0c3cf', '929398']
			},
			scale: {
				start: {
					min: 4,
					max: 24
				},
				end: {
					min: 0,
					max: 12
				}
			},
			frequency: 0.02,
			emitterLifetime: 0.15,
			spawnType: 'circle',
			lifetime: {
				min: 1,
				max: 2
			},
			spawnCircle: {
				x: 0,
				y: 0,
				r: 8
			},
			speed: {
				start: {
					min: 4,
					max: 24
				},
				end: {
					min: 0,
					max: 12
				}
			},
			randomSpeed: true,
			randomScale: true,
			randomColor: true
		}
	}, {
		name: 'Smite',
		description: 'Calls down holy energy from the heavens upon your foe.',
		type: 'melee',
		row: 2,
		col: 0,
		icon: [0, 0],
		animation: 'hitStaff'
	}, {
		name: 'Healing Circle',
		description: 'Creates a circle of pure holy energy that heals allies for a brief period.',
		type: 'healingCircle',
		icon: [0, 1],
		animation: 'raiseStaff',
		particles: {
			scale: {
				start: {
					min: 6,
					max: 16
				},
				end: {
					min: 0,
					max: 4
				}
			},
			speed: {
				start: {
					min: 2,
					max: 12
				},
				end: {
					min: 0,
					max: 4
				}
			},
			lifetime: {
				min: 1,
				max: 3
			},
			alpha: {
				start: 0.45,
				end: 0
			},
			color: {
				start: ['ffeb38', 'fcfcfc'],
				end: ['fcfcfc', 'faac45']
			},
			spawnType: 'circle',
			spawnCircle: {
				x: 0,
				y: 0,
				r: 12
			},
			randomScale: true,
			randomColor: true,
			randomSpeed: true,
			chance: 0.02
		}
	}, {
		name: 'Holy Vengeance',
		description: 'Grants holy vengeance to a friendly target. For the duration of the effect, dealing damage will also heal the attacker.',
		type: 'holyVengeance',
		spellType: 'buff',
		icon: [0, 2]
	}, {
		name: 'Slash',
		description: 'Performs a melee attack with your equipped weapon.',
		type: 'melee',
		row: 0,
		col: 0,
		icon: [3, 0],
		animation: 'hitSword'
	}, {
		name: 'Charge',
		type: 'charge',
		description: 'Charges at a foe, dealing damage and stunning them for a short period.',
		type: 'charge',
		icon: [3, 1],
		animation: 'raiseShield'
	}, {
		name: 'Reflect Damage',
		type: 'reflectdamage',
		description: 'Gain an ethereal shield that reflects damage until the buff wears off.',
		type: 'reflectDamage',
		icon: [3, 2],
		animation: 'raiseShield'
	}, {
		name: 'Double Slash',
		type: 'melee',
		description: 'Perform two quick melee attacks in succession',
		animation: 'hitSword',
		row: 1,
		col: 0,
		icon: [2, 0]
	}, {
		name: 'Smokebomb',
		type: 'smokeBomb',
		description: 'Envelops the thief in a cloud of poisonous smoke, dealing damage to enemies every tick until it dissipates.',
		animation: 'raiseHands',
		icon: [2, 1],
		particles: {
			scale: {
				start: {
					min: 16,
					max: 30
				},
				end: {
					min: 8,
					max: 14
				}
			},
			opacity: {
				start: 0.02,
				end: 0
			},
			lifetime: {
				min: 1,
				max: 3
			},
			speed: {
				start: 12,
				end: 2
			},
			color: {
				start: ['fcfcfc', '80f643'],
				end: ['c0c3cf', '2b4b3e']
			},
			chance: 0.03,
			randomColor: true,
			randomScale: true,
			blendMode: 'screen'
		}
	}, {
		name: 'Stealth',
		description: 'The thief slips into the shadows and becomes undetectable by foes. Performing an attack removes this effect.',
		type: 'stealth',
		icon: [2, 2]
	}/*, {
		name: 'Web Bolt',
		description: 'Encases your target in webs, preventing them from doing anything for a short period',
		type: 'cocoon',
		manaCost: 10,
		icon: [4, 0],
		damage: 0,
		ttl: 15,
		range: 9,
		threatMult: 1,
		row: 4,
		col: 4,
		cdMax: 10,
		particles: {
			color: {
				start: ['f2f5f5', '505360'],
				end: ['505360', 'f2f5f5']
			},
			speed: {
				start: {
					min: 0,
					max: 4
				},
				end: {
					min: 0,
					max: 4
				}
			},
			randomSpeed: true,
			randomColor: true,
			chance: 0.4
		}
	}*/, {
		name: 'Crystal Spikes',
		description: 'Jagged Crystals break ground at your target destination',
		type: 'warnBlast',
		animation: 'raiseHands',
		icon: [4, 0],
		particles: {
			color: {
				start: ['c0c3cf', '929398'],
				end: ['929398', 'c0c3cf']
			},
			scale: {
				start: {
					min: 4,
					max: 10
				},
				end: {
					min: 0,
					max: 4
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
			spawnType: 'circle',
			spawnCircle: {
				x: 0,
				y: 0,
				r: 12
			},
			randomScale: true,
			randomSpeed: true,
			chance: 0.075,
			randomColor: true
		}
	}, {
		name: 'Arcane Barrier',
		description: 'Creates a circle of pure holy energy that heals allies for a brief period.',
		type: 'arcaneBarrier',
		icon: [0, 1],
		animation: 'raiseStaff',
		particles: {
			scale: {
				start: {
					min: 6,
					max: 16
				},
				end: {
					min: 0,
					max: 4
				}
			},
			speed: {
				start: {
					min: 2,
					max: 12
				},
				end: {
					min: 0,
					max: 4
				}
			},
			lifetime: {
				min: 1,
				max: 3
			},
			alpha: {
				start: 0.45,
				end: 0
			},
			color: {
				start: ['ffeb38', 'fcfcfc'],
				end: ['fcfcfc', 'faac45']
			},
			spawnType: 'circle',
			spawnCircle: {
				x: 0,
				y: 0,
				r: 12
			},
			randomScale: true,
			randomColor: true,
			randomSpeed: true,
			chance: 0.02
		}
	}];

	events.emit('onBeforeGetSpellsInfo', spells);
	return spells;
});