define([
	'items/config/slots'
], function(
	configSlots
) {
	var chances = [];
	for (var c in configSlots.chance) {
		var rolls = configSlots.chance[c];
		for (var i = 0; i < rolls; i++) {
			chances.push(c);
		}
	}

	var generator = {
		generate: function(item, blueprint) {
			if (blueprint.slot)
				item.slot = blueprint.slot;
			else
				item.slot = chances[~~(Math.random() * chances.length)];

			if (!blueprint.statMult)
				blueprint.statMult = {};
			if (!blueprint.statMult.armor)
				blueprint.statMult.armor = configSlots.armorMult[item.slot];
		}
	};

	return generator;
});