define([

], function(

) {
	return {
		id: 'example',
		name: 'Example',
		decription: 'An example faction.',

		initialRep: 1000,
		tiers: [{
			name: 'Hated',
			rep: -25000
		}, {
			name: 'Hostile',
			rep: -10000
		}, {
			name: 'Unfriendly',
			rep: -1000
		}, {
			name: 'Neutral',
			rep: 0
		}, {
			name: 'Friendly',
			rep: 1000
		}, {
			name: 'Honored',
			rep: 10000
		}, {
			name: 'Revered',
			rep: 25000
		}, {
			name: 'Exalted',
			rep: 50000
		}],

		rewards: {
			honored: [],
			revered: [],
			exalted: []
		}
	};
});