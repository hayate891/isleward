define([
	
], function(
	
) {
	return {
		generators: [
			'basic',
			[ 'basic', 'prefix' ],
			[ 'basic', 'prefix', 'suffix' ],
			[ 'basic', 'prefix', 'suffix' ],
			[ 'basic', 'legendary', 'suffix']
		],
		prefixes: {
			hpMax: 'Healthy',
			regenHp: 'Regenerating',
			manaMax: `Caster's`,
			regenMana: 'Tapping',
			str: 'Brutal',
			int: 'Wise',
			dex: 'Agile',
			addArmor: 'Plated',
			addCritChance: 'Precise',
			magicFind: `Seeker's`,
			sprintChance: `Traveller's`,
			dmgPercent: 'Powerful',
			allAttributes: 'Hybrid',
			elementArcanePercent: 'Volatile',
			elementFrostPercent: 'Frigid',
			elementFirePercent: 'Burning',
			elementHolyPercent: 'Righteous',
			elementPhysicalPercent: `Brawler's`,
			elementPoisonPercent: 'Bubbling',

			elementArcaneResist: 'Protective',
			elementFrostResist: 'Protective',
			elementFireResist: 'Protective',
			elementHolyResist: 'Protective',
			elementPhysicalResist: `Protective`,
			elementPoisonResist: 'Protective',
			elementAllResist: 'Protective',

			xpIncrease: `Scholar's`,
		},
		suffixes: {
			hpMax: 'Health',
			regenHp: 'Regeneration',
			manaMax: 'Mana',
			regenMana: 'Orbs',
			str: 'the Titan',
			int: 'Angels',
			dex: 'the Assassin',
			addArmor: 'the Fortress',
			addCritChance: 'Pain',
			magicFind: 'Luck',
			sprintChance: 'Haste',
			dmgPercent: 'Power',
			allAttributes: 'Divergence',
			elementArcanePercent: 'the Magi',
			elementFrostPercent: 'Winter',
			elementFirePercent: 'the Inferno',
			elementHolyPercent: 'the Gods',
			elementPhysicalPercent: 'Combat',
			elementPoisonPercent: 'Poison',

			elementArcaneResist: 'Arcane Resistance',
			elementFrostResist: 'Frost Resistance',
			elementFireResist: 'Fire Resistance',
			elementHolyResist: 'Holy Resistance',
			elementPhysicalResist: `Physical Resistance`,
			elementPoisonResist: 'Poison Resistance',
			elementAllResist: 'Arcane Resistance',

			xpIncrease: 'Experience'
		},
		generate: function(item, blueprint) {
			if (blueprint.name) {
				item.name = blueprint.name;
				return;
			}
			else if (blueprint.noName) {
				item.name = item.type;
				return;
			}

			var gen = this.generators[item.quality];
			if (!(gen instanceof Array))
				gen = [ gen ];

			gen.forEach(g => this.types[g].call(this, item, blueprint));
		},
		types: {
			basic: function(item, blueprint) {
				item.name = item.type;
			},
			prefix: function(item, blueprint) {
				var maxStat = '';
				var maxValue = 0;
				for (var s in item.stats) {
					if ((item.stats[s] > maxValue) && (this.prefixes[s])) {
						maxValue = item.stats[s];
						maxStat = s;
					}
				}

				item.name = this.prefixes[maxStat] + ' ' + item.name;
			},
			suffix: function(item, blueprint) {
				var stats = [];
				for (var s in item.stats) {
					if (this.suffixes[s])
						stats.push({ stat: s, value: item.stats[s] });
				}
				stats.sort((a, b) => b.value - a.value);

				var useIndex = 1;
				if (useIndex >= stats.length)
					useIndex = 0;

				item.name = item.name + ' of ' + this.suffixes[stats[useIndex].stat];
			},
			legendary: function(item, blueprint) {
				item.name = 'Legendary ' + item.name;
			}
		}
	};
});