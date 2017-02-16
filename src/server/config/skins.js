define([

], function(

) {
	var config = {
		'wizard 1': {
			name: 'Wizard 1',
			sprite: [2, 0],
			class: 'wizard',
			default: true
		},
		'wizard 2': {
			name: 'Wizard 2',
			sprite: [3, 0],
			class: 'wizard',
			default: true
		},
		'warrior 1': {
			name: 'Warrior 1',
			sprite: [1, 1],
			class: 'warrior',
			default: true
		},
		'warrior 2': {
			name: 'Warrior 2',
			sprite: [2, 1],
			class: 'warrior',
			default: true
		},
		'cleric 1': {
			name: 'Cleric 1',
			sprite: [4, 0],
			class: 'cleric',
			default: true
		},
		'cleric 2': {
			name: 'Cleric 2',
			sprite: [5, 0],
			class: 'cleric',
			default: true
		},
		'thief 1': {
			name: 'Thief 1',
			sprite: [6, 0],
			class: 'thief',
			default: true
		},
		'thief 2': {
			name: 'Thief 2',
			sprite: [7, 0],
			class: 'thief',
			default: true
		},

		'gaekatla druid': {
			name: 'Skin: Gaekatlan Druid',
			sprite: [0, 4],
			class: 'cleric'
		}
	};

	return {
		getBlueprint: function(skinId) {
			return config[skinId];
		},

		getSkinList: function(skins) {
			var list = Object.keys(config)
				.filter(function(s) {
					return ((config[s].default) || (skins.some(f => (f == s))));
				})
				.map(function(s) {
					return config[s];
				});

			var result = {};
			list.forEach(function(l) {
				if (!result[l.class])
					result[l.class] = [];

				result[l.class].push(l.sprite[0] + ',' + l.sprite[1]);
			});

			return result;
		}
	};
});