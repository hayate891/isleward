define([
	'misc/events'
], function(
	events
) {
	var classes = {
		spells: {
			wizard: ['ice spear'],
			cleric: ['healing circle'],
			warrior: ['charge'],
			thief: ['smokebomb']
		},
		stats: {
			wizard: {
				values: {
					hpMax: 80
				},
				vitScale: 10,
			},
			cleric: {
				values: {
					hpMax: 90
				},
				vitScale: 10
			},
			warrior: {
				values: {
					hpMax: 110
				},
				vitScale: 10
			},
			thief: {
				values: {
					hpMax: 100
				},
				vitScale: 10
			}
		},
		weapons: {
			wizard: 'Gnarled Staff',
			cleric: 'Mace',
			thief: 'Dagger',
			warrior: 'Axe'
		},

		getSpritesheet: function(className) {
			return this.stats[className].spritesheet || 'characters';
		}
	};

	events.emit('onBeforeGetClasses', classes);
	return classes;
});