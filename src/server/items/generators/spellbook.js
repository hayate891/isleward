define([
	'../../config/spells',
	'../../config/spellsConfig'
], function(
	spells,
	spellsConfig
) {
	var maxQuality = 5;

	return {
		generate: function(item, blueprint) {
			blueprint = blueprint || {};
			var spellQuality = blueprint ? blueprint.spellQuality : '';
			var spellName = blueprint.spellName;
			
			if (!spellName) {
				var spellList = Object.keys(spellsConfig).filter(s => !spellsConfig[s].auto);
				spellName = spellList[~~(Math.random() * spellList.length)];
			}

			var spell = spellsConfig[spellName];
			var spellAesthetic = spells.find(s => s.name.toLowerCase() == spellName);

			if (!item.slot) {
				var sprite = [10, 0];
				var statType = spell.statType;
				if (statType == 'dex')
					sprite = [10, 1];
				else if (statType == 'str')
					sprite = [10, 2];
				else if (statType instanceof Array) {
					if ((statType.indexOf('dex') > -1) && (statType.indexOf('int') > -1))
						sprite = [10, 3];
				}

				item.name = 'Rune of ' + spellAesthetic.name;
				item.ability = true;
				item.sprite = sprite;
			}
			else if (spellQuality == 'mid')
				item.stats = {};

			item.spell = {
				name: spellAesthetic.name,
				type: spellAesthetic.type,
				rolls: {},
				values: {}
			};

			var propertyPerfection = [];

			var randomProperties = spell.random || {};
			for (var r in randomProperties) {
				var range = randomProperties[r];
				var roll = random.norm(0, 1);
				if (spellQuality == 'basic')
					roll = 0;
				else if (spellQuality == 'mid')
					roll = 0.5;

				item.spell.rolls[r] = roll;

				var int = r.indexOf('i_') == 0;
				var val = range[0] + ((range[1] - range[0]) * roll);
				if (int) {
					val = ~~val;
					r = r.replace('i_', '');
				}
				else
					val = ~~(val * 10) / 10;

				item.spell.values[r] = val;

				if (roll <= 0.5)
					propertyPerfection.push(0);
				else
					propertyPerfection.push(roll / 1);
			}

			if (blueprint.spellProperties) {
				item.spell.properties = {};
				for (var p in blueprint.spellProperties) {
					item.spell.properties[p] = blueprint.spellProperties[p];
				}
			}

			var perfection = ~~(propertyPerfection.reduce((p, n) => p += n, 0) / propertyPerfection.length * 4);
			if (!item.slot)	
				item.quality = perfection;
			else
				item.spell.quality = perfection
		}
	};
});