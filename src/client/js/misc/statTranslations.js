define([

], function(

) {
	var stats = {
		'vit': 'vitality',
		'hpMax': 'vitality',
		'regenHp': 'health regeneration',
		'manaMax': 'maximum mana',
		'regenMana': 'mana regeneration',
		'str': 'strength',
		'int': 'intellect',
		'dex': 'dexterity',
		'armor': 'armor',
		'addCritChance': 'increased crit chance',
		'magicFind': 'magic find',
		'sprintChance': 'sprint chance',
		'dmgPercent': 'to all damage',
		'allAttributes': 'to all attributes',
		'xpIncrease': 'additional xp per kill',

		'elementArcanePercent': 'increased arcane damage',
		'elementFrostPercent': 'increased frost damage',
		'elementFirePercent': 'increased fire damage',
		'elementHolyPercent': 'increased holy damage',
		'elementPhysicalPercent': 'increased physical damage',
		'elementPoisonPercent': 'increased poison damage',

		'elementArcaneResist': 'arcane resistance',
		'elementFrostResist': 'frost resistance',
		'elementFireResist': 'fire resistance',
		'elementHolyResist': 'holy resistance',
		'elementPhysicalResist': 'physical resistance',
		'elementPoisonResist': 'poison resistance',
		'elementAllResist': 'all resistance',

		//This stat is used for gambling when you can't see the stats
		'stats': 'stats'
	};

	return {
		translate: function(stat) {
			return stats[stat];
		}
	};
});