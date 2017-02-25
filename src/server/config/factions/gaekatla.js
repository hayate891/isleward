define([
	'world/spawners',
	'world/mobBuilder'
], function(
	spawners,
	mobBuilder
) {
	return {
		id: 'gaekatla',
		name: 'Gaekatla',
		description: `Gaekatla; the goddess of nature.`,

		uniqueStat: {
			chance: {
				min: 5,
				max: 20
			},

			generate: function(item) {
				var chance = this.chance;
				var chanceRoll = ~~(random.norm(chance.min, chance.max) * 10) / 10;

				var result = null;
				if (item.effects)
					result = item.effects.find(e => (e.factionId == 'gaekatla'));

				if (!result) {
					if (!item.effects)
						item.effects = [];

					result = {
						factionId: 'gaekatla',
						chance: chanceRoll,
						text: chanceRoll + '% chance on kill to summon a critter to assist you in battle',
						events: {}
					};

					item.effects.push(result);
				}

				if (!result.events)
					result.events = {};

				for (var e in this.events) {
					result.events[e] = this.events[e];
				}

				return result;
			},

			events: {
				afterKillMob: function(item, mob) {
					var effect = item.effects.find(e => (e.factionId == 'gaekatla'));

					var roll = Math.random() * 100;
					if (roll >= this.chance)
						return;

					//Spawn a mob
					var mob = mob.instance.spawners.spawn({
						amountLeft: 1,
						blueprint: {
							x: mob.x,
							y: mob.y,
							cell: 34,
							sheetName: 'mobs',
							name: 'Squiggle'
						}
					});

					mobBuilder.build(mob, {
						level: 5,
						faction: this.aggro.faction,
						walkDistance: 2,
						regular: {
							drops: 0,
							hpMult: 1,
							dmgMult: 1
						},
					}, false, 'regular');
				}
			}
		},

		rewards: {

		}
	};
});