define([

], function(

) {
	var mappings = {
		rune: [{
			materials: [{
				name: 'Essence',
				qualityName: ['Common Essence', 'Magic Essence', 'Rare Essence', 'Epic Essence', 'Legendary Essence'],
				chance: 100,
				quantity: 1
			}]
		}],
		slots: [{
			list: ['neck', 'finger', 'twoHanded'],
			materials: [{
				name: 'Iron Bar',
				chance: 100,
				quantity: 3,
				qualityMult: 1.1
			}]
		}, {
			list: ['trinket'],
			materials: [{
				name: 'Essence',
				qualityName: ['Common Essence', 'Magic Essence', 'Rare Essence', 'Epic Essence', 'Legendary Essence'],
				chance: 100,
				quantity: 1
			}]
		}],
		types: [{
			list: ['Helmet', 'Belt', 'Legplates', 'Gauntlets', 'Steel Boots', 'Breastplate'],
			materials: [{
				name: 'Iron Bar',
				chance: 100,
				quantity: 3,
				qualityMult: 1.1
			}]
		}, {
			list: ['Cowl', 'Robe', 'Gloves', 'Sash', 'Pants', 'Boots'],
			materials: [{
				name: 'Cloth Scrap',
				chance: 100,
				quantity: 3,
				qualityMult: 1.1
			}]
		}, {
			list: ['Leather Cap', 'Leather Armor', 'Leather Gloves', 'Leather Belt', 'Leather Pants', 'Leather Boots', 'Facemask', 'Scalemail', 'Scale Gloves', 'Scaled Binding', 'Scale Leggings', 'Scale Boots'],
			materials: [{
				name: 'Leather Scrap',
				chance: 100,
				quantity: 3,
				qualityMult: 1.1
			}]
		}]
	};

	var materialItems = {
		'Iron Bar': {
			sprite: [0, 0]
		},
		'Cloth Scrap': {
			sprite: [0, 1]
		},
		'Leather Scrap': {
			sprite: [0, 7]
		},
		'Common Essence': {
			sprite: [0, 2]
		},
		'Magic Essence': {
			sprite: [0, 3]
		},
		'Rare Essence': {
			sprite: [0, 4]
		},
		'Epic Essence': {
			sprite: [0, 5]
		},
		'Legendary Essence': {
			sprite: [0, 6]
		}
	};

	return {
		salvage: function(item, maxRoll) {
			var result = [];

			var materials = [];

			var temp = mappings.slots.filter(m => m.list.indexOf(item.slot) > -1);
			temp = temp.concat(mappings.types.filter(m => m.list.indexOf(item.type) > -1));

			if (item.ability) {
				temp = temp.concat(mappings.rune);
			}

			temp.forEach(function(t) {
				var mats = t.materials;
				mats.forEach(function(m) {
					var exists = materials.find(mf => (mf.name == m.name));
					if (exists) {
						exists.chance = Math.max(exists.chance, m.chance);
						exists.quantity = Math.max(exists.quantity, m.quantity);
						exists.qualityMult = Math.max(exists.qualityMult, m.qualityMult);
					} else
						materials.push(extend(true, {}, m));
				});
			});

			materials.forEach(function(m) {
				var roll = Math.random() * 100;
				if (maxRoll)
					roll = 0;
				if (roll > m.chance)
					return;

				var max = m.quantity;
				if (m.qualityMult)
					max *= (m.qualityMult * (item.quality + 1));

				var quantity = Math.ceil(random.norm(0, 1) * max) || 1;
				if (maxRoll)
					quantity = Math.ceil(max);

				var newItem = {
					name: m.name,
					quantity: quantity,
					quality: 0,
					material: true,
					sprite: null
				};

				if (m.qualityName) {
					newItem.quality = item.quality;
					newItem.name = m.qualityName[item.quality];
				}

				newItem.sprite = materialItems[newItem.name].sprite;

				result.push(newItem);
			});

			return result;
		}
	};
});