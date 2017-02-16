define([
	'items/generators/level',
	'items/generators/quality',
	'items/generators/slots',
	'items/generators/types',
	'items/generators/stats',
	'items/generators/names',
	'items/generators/worth',
	'items/generators/spellbook',
	'items/salvager'
], function(
	g1, g2, g3, g4, g5, g6, g7,
	g8
) {
	var generators = [].slice.apply(arguments, [0, 7]);
	var spellGenerators = [g1, g8];

	var generator = {
		spellChance: 0.15,
		generate: function(blueprint) {
			var hadBlueprint = !!blueprint;
			blueprint = blueprint || {};

			var item = {};

			if ((!blueprint.slot) && (!blueprint.noSpell)) {
				var isSpell = blueprint.spell;
				if ((!isSpell) && ((!hadBlueprint) || ((!blueprint.type) && (!blueprint.slot) && (!blueprint.stats))))
					isSpell = Math.random() < this.spellChance;
			}

			if (isSpell)
				spellGenerators.forEach(g => g.generate(item, blueprint));
			else {
				generators.forEach(g => g.generate(item, blueprint));
				if (blueprint.spellName)
					g8.generate(item, blueprint);
			}

			if (blueprint.noSalvage)
				item.noSalvage = true;

			return item;
		},

		removeStat: function(item, stat) {
			if (!stat) {
				stat = Object.keys(item.stats)
					.filter(s => (s != 'armor'));

				stat = stat[~~(Math.random() * stat.length)];
			}

			delete item.stats[stat];
		},

		pickRandomSlot: function() {
			var item = {};
			var blueprint = {};
			g3.generate(item, blueprint);

			return item.slot;
		}
	};

	/*require('misc/random');

	for (var i = 0; i < 1000; i++) {
		var item = generator.generate();
		if (item.slot == 'tool') {
			console.log(item);
		}
	}*/

	/*var qualities = [0, 0, 0, 0, 0];
	var count = 716;

	for (var i = 0; i < count; i++) {
		qualities[generator.generate({
			magicFind: 200,
			noSpell: true
		}).quality]++;
	}

	//console.log(qualities.map(q => (q / count) * 100));
	console.log(qualities.map(q => q));*/

	/*for (var i = 0; i < 10; i++) {
		var item = generator.generate({
			quality: 4,
			level: 10
		});

		if (item.slot)
			console.log(item.slot + ' ' + ~~item.stats.armor);
	}*/

	/*var max = 0;
	for (var i = 0; i < 1000; i++) {
		var roll = random.norm(20, 32);
		if (roll > max)
			max = roll;
	}
	console.log(max);*/

	return generator;
});