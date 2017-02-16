define([

], function(

) {
	return {
		slots: [
			'head',
			'neck',
			'chest',
			'hands',
			'finger',
			'waist',
			'legs',
			'feet',
			'trinket',
			'twoHanded',
			'tool'
		],

		chance: {
			head: 10,
			neck: 4,
			chest: 10,
			hands: 10,
			finger: 4,
			waist: 8,
			legs: 10,
			feet: 10,
			trinket: 2,
			twoHanded: 6,
			tool: 1
		},

		armorMult: {
			head: 0.2,
			neck: 0,
			chest: 0.4,
			hands: 0.1,
			finger: 0,
			waist: 0,
			legs: 0.2,
			feet: 0.1,
			trinket: 0,
			twoHanded: 0,
			tool: 0
		}
	};
});