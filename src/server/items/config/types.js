define([

], function(

) {
	return {
		head: {
			'Helmet': {
				sprite: [0, 0],
				material: 'plate'
			},
			'Cowl': {
				sprite: [0, 1],
				material: 'cloth'
			},
			'Leather Cap': {
				sprite: [0, 2],
				material: 'leather'
			},
			'Facemask': {
				sprite: [0, 3],
				material: 'leather'
			}
		},
		neck: {
			'Pendant': {
				sprite: [1, 0]
			},
			'Amulet': {
				sprite: [1, 1]
			},
			'Locket': {
				sprite: [1, 2]
			},
			'Choker': {
				sprite: [1, 3]
			}
		},
		chest: {
			'Breastplate': {
				sprite: [2, 0],
				material: 'plate'
			},
			'Robe': {
				material: 'cloth',
				sprite: [2, 1]
			},
			'Leather Armor': {
				sprite: [2, 2],
				material: 'leather'
			},
			'Scalemail': {
				sprite: [2, 3],
				material: 'leather'
			}
		},
		hands: {
			'Gauntlets': {
				sprite: [3, 0],
				material: 'plate'
			},
			'Gloves': {
				material: 'cloth',
				sprite: [3, 1]
			},
			'Leather Gloves': {
				sprite: [3, 2],
				material: 'leather'
			},
			'Scale Gloves': {
				sprite: [3, 3],
				material: 'leather'
			}
		},
		finger: {
			'Signet': {
				sprite: [4, 0]
			},
			'Ring': {
				sprite: [4, 1]
			},
			'Loop': {
				sprite: [4, 2]
			},
			'Viridian Band': {
				sprite: [4, 3]
			}
		},
		waist: {
			'Belt': {
				material: 'plate',
				sprite: [5, 0]
			},
			'Sash': {
				material: 'cloth',
				sprite: [5, 1]
			},
			'Leather Belt': {
				material: 'leather',
				sprite: [5, 2]
			},
			'Scaled Binding': {
				material: 'leather',
				sprite: [5, 3]
			}
		},
		legs: {
			'Legplates': {
				material: 'plate',
				sprite: [6, 0]
			},
			'Pants': {
				material: 'cloth',
				sprite: [6, 1]
			},
			'Leather Pants': {
				sprite: [6, 2],
				material: 'leather'
			},
			'Scale Leggings': {
				sprite: [6, 3],
				material: 'leather'
			}
		},
		feet: {
			'Steel Boots': {
				material: 'plate',
				sprite: [7, 0]
			},
			'Boots': {
				material: 'cloth',
				sprite: [7, 1]
			},
			'Leather Boots': {
				material: 'leather',
				sprite: [7, 2]
			},
			'Scale Boots': {
				material: 'leather',
				sprite: [7, 3]
			}
		},
		trinket: {
			'Forged Ember': {
				sprite: [8, 0]
			},
			'Smokey Orb': {
				sprite: [8, 1]
			},
			'Quartz Fragment': {
				sprite: [8, 2]
			},
			'Mystic Card': {
				sprite: [8, 3]
			},
			'Dragon Fang': {
				sprite: [8, 4]
			}
		},
		twoHanded: {
			'Sword': {
				sprite: [9, 0],
				spellName: 'slash'
			},
			'Gnarled Staff': {
				sprite: [9, 1],
				spellName: 'magic missile'
			},
			'Dagger': {
				sprite: [9, 2],
				spellName: 'double slash'
			},
			'Axe': {
				sprite: [9, 3],
				spellName: 'slash',
				onlyDungeon: true
			},
			'Mace': {
				sprite: [9, 4],
				spellName: 'smite'
			},
			'Spear': {
				sprite: [9, 6],
				spellName: 'slash',
				range: 2
			}
		},
		tool: {
			'Fishing Rod': {
				sprite: [11, 0]
			}
		}
	}
});