define([
	'items/generators/stats',
	'items/salvager'
], function(
	generatorStats,
	salvager
) {
	return {
		enchant: function(obj, item, msg) {
			var inventory = obj.inventory;
			var config = this.getEnchantMaterials(item, msg.action);

			var success = true;
			config.materials.forEach(function(m) {
				var hasMaterial = inventory.items.find(i => i.name == m.name);
				if (hasMaterial)
					hasMaterial = hasMaterial.quantity >= m.quantity;
				if (!hasMaterial)
					success = false;
			});

			if (!success) {
				inventory.resolveCallback(msg);
				return;
			}

			var result = {
				item: item,
				addStatMsgs: []
			};
			result.success = (Math.random() * 100) < config.successChance;

			config.materials.forEach(function(m) {
				var invMaterial = inventory.items.find(i => i.name == m.name);
				inventory.destroyItem(invMaterial.id, m.quantity);
			});

			var newPower = (item.power || 0) + 1;
			item.power = newPower;

			if ((result.success) && (msg.action != 'scour'))
				this.addStat(item, result);
			else if (item.enchantedStats) {
				for (var p in item.enchantedStats) {
					var value = item.enchantedStats[p];

					if (item.stats[p]) {
						result.addStatMsgs.push('-' + value + ' ' + p);
						item.stats[p] -= value;
						if (item.stats[p] <= 0)
							delete item.stats[p];
					}
				}

				delete item.enchantedStats;
				delete item.power;
			}

			obj.syncer.setArray(true, 'inventory', 'getItems', item);

			inventory.resolveCallback(msg, result);
		},

		addStat: function(item, result) {
			generatorStats.generate(item, {
				statCount: 1
			}, result);
		},

		getEnchantMaterials: function(item, action) {
			var result = salvager.salvage(item, true);

			var powerLevel = item.power || 0;
			powerLevel = Math.min(powerLevel, 9);
			var mult = [2, 3, 5, 8, 12, 17, 23, 30, 38, 47][powerLevel];
			if (action == 'scour')
				mult *= 0.2;

			result.forEach(r => r.quantity = Math.max(1, ~~(r.quantity * mult)));

			var successChance = [100, 60, 35, 15, 7, 3, 2, 1, 1, 1][powerLevel];
			if (action == 'scour') {
				successChance = 100;
				if (powerLevel == 0)
					result = [];
			}

			return {
				materials: result,
				successChance: successChance
			};
		}
	};
});