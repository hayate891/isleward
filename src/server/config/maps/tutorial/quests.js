define([

], function(

) {
	return {
		infini: [{
			name: 'Purveyor of Artefacts',
			type: 'loot',
			subType: 'slot',
			quantity: 1
		}, {
			name: 'The Culling',
			type: 'killX',
			subType: 'mobType',
			quantity: [5, 10]
		}, {
			name: '$itemName$ Gatherer',
			type: 'lootGen',
			subType: '',
			quantity: [3, 7],
			dropChance: 0.5
		}, {
			name: 'Green Fingers',
			type: 'gatherResource',
			subType: 'herb',
			quantity: [5, 10]
		}]
	};
});