define([
	'../config/types',
	'../config/armorMaterials'
], function(
	configTypes,
	armorMaterials
) {
	return {
		generate: function(item, blueprint) {
			var type = blueprint.type || _.randomKey(configTypes[item.slot]);
			var typeBlueprint = configTypes[item.slot][type];

			if (!typeBlueprint)
				return;

			item.type = type;
			item.sprite = typeBlueprint.sprite;
			if (typeBlueprint.spritesheet)
				item.spritesheet = typeBlueprint.spritesheet;

			if (typeBlueprint.spellName)
				blueprint.spellName = typeBlueprint.spellName;

			if (typeBlueprint.range)
				item.range = typeBlueprint.range;

			if ((typeBlueprint.material) && (blueprint.statMult.armor))
				blueprint.statMult.armor *= armorMaterials[typeBlueprint.material].statMult.armor;

			if (item.slot == 'tool') {
				blueprint.noStats = true;
				blueprint.noName = true;
			}
		}
	}
});