define([

], function(

) {
	var max = Math.max.bind(Math);
	var mathRandom = Math.random.bind(Math);

	return {
		getDamage: function(config) {
			var srcValues = config.source.stats.values;
			var tgtValues = config.target.stats.values;

			var statValue = 0;
			var statType = config.statType;
			if (!(statType instanceof Array))
				statType = [statType];
			var dmg = 0;
			statType.forEach(function(s) {
				statValue += srcValues[s];
			});

			statValue = max(1, statValue);

			var dmgPercent = srcValues.dmgPercent;
			var resist = srcValues.elementAllResist;
			if (config.element) {
				var elementName = 'element' + config.element[0].toUpperCase() + config.element.substr(1);
				dmgPercent += srcValues[elementName + 'Percent'];
				resist += (tgtValues[elementName + 'Resist'] || 0);
			}

			var dps = (
				(config.statMult * statValue * config.damage) *
				max((0.5 + (dmgPercent / 100)), 0.5)
			);

			//Don't mitigate heals
			if (!config.noMitigate) {
				dps = (
					dps *
					max(0.5 + max((1 - ((tgtValues.armor || 0) / (srcValues.level * 51.2))) / 2, -0.5), 0.5) *
					max(0.5 + max((1 - (resist / 75)) / 2, -0.5), 0.5)
				);
			}

			var cd = config.source.mob ? 1 : config.cd;

			var amount = dps * cd * 0.3;

			var isCrit = false;
			if (!config.noCrit) {
				var critChance = srcValues.critChance;
				var roll = mathRandom() * 100;
				if ((roll < critChance) || (config.crit)) {
					isCrit = true;
					amount *= 1.5;
				}
			}

			amount *= 10000;

			return {
				amount: amount,
				crit: isCrit,
				element: config.element
			};
		}
	};
});