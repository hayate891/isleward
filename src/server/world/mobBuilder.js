define([
	'config/animations',
	'items/generator',
	'combat/combat'
], function(
	animations,
	itemGenerator,
	combat
) {
	return {
		build: function(mob, blueprint, scaleDrops, type) {
			var typeDefinition = blueprint[type];

			var drops = typeDefinition.drops;

			mob.isMob = true;
			mob.scaleDrops = scaleDrops;

			if (blueprint.nonSelectable)
				mob.nonSelectable = true;

			mob.addComponent('effects');
			if (type != 'regular') {
				mob.effects.addEffect({
					type: type
				});

				mob['is' + type[0].toUpperCase() + type.substr(1)] = true;

				mob.baseName = mob.name;
				mob.name = typeDefinition.name || mob.baseName;
			}

			mob.addComponent('stats', {
				values: {
					level: blueprint.level
				}
			});

			var cpnMob = mob.addComponent('mob');
			cpnMob.walkDistance = blueprint.walkDistance;
			cpnMob.hpMult = typeDefinition.hpMult;
			cpnMob.dmgMult = typeDefinition.dmgMult;
			cpnMob.grantRep = blueprint.grantRep;
			cpnMob.deathRep = blueprint.deathRep;

			var spells = extend(true, [], blueprint.spells);
			spells.forEach(function(s) {
				if (!s.animation) {
					if ((mob.sheetName == 'mobs') && (animations.mobs[mob.cell])) {
						s.animation = 'basic';
					}
				}
			});

			mob.addComponent('spellbook', {
				spells: spells,
				dmgMult: typeDefinition.dmgMult
			});

			var attackable = blueprint.attackable;
			if ((attackable === undefined) || (attackable === true)) {
				mob.addComponent('aggro', {
					faction: blueprint.faction
				});
			}

			mob.addComponent('equipment');
			mob.addComponent('inventory', drops);

			if (this.zone) {
				var chats = this.zone.chats;
				if ((chats) && (chats[mob.name.toLowerCase()])) {
					mob.addComponent('chatter', {
						chats: chats[mob.name.toLowerCase()]
					});
				}

				var dialogues = this.zone.dialogues;
				if ((dialogues) && (dialogues[mob.name.toLowerCase()])) {
					mob.addComponent('dialogue', {
						config: dialogues[mob.name.toLowerCase()]
					});
				}
			}

			if ((blueprint.properties) && (blueprint.properties.cpnTrade))
				mob.addComponent('trade', blueprint.properties.cpnTrade);

			this.scale(mob, blueprint.level);
		},

		scale: function(mob, level) {
			if ((mob.aggro) && (mob.aggro.list > 0))
				return;

			var drops = mob.inventory.blueprint || {};

			var statValues = mob.stats.values;

			var preferStat = ['str', 'dex', 'int'][~~(Math.random() * 3)];
			var elementType = ['physical', 'poison', 'frost', 'fire', 'holy', 'arcane'][~~(Math.random() * 6)];

			mob.equipment.unequipAll();
			mob.inventory.clear();

			var hp = 10 + (level * 120);
			statValues.hpMax = hp;

			statValues.level = level;

			if (!drops.blueprints) {
				[
					'head',
					'chest',
					'neck',
					'hands',
					'waist',
					'legs',
					'feet',
					'finger',
					'trinket',
					'twoHanded'
				].forEach(function(slot) {
					var item = itemGenerator.generate({
						noSpell: true,
						level: level,
						slot: slot,
						forceStats: [preferStat]
					});
					mob.inventory.getItem(item);
				}, this);
			} else {
				//TODO: Don't give the mob these items: he'll drop them anyway
				drops.blueprints.forEach(function(d) {
					var drop = extend(true, {}, d);
					d.level = level;
					mob.inventory.getItem(itemGenerator.generate(drop));
				}, this);
			}

			var spellCount = (mob.isRare ? 1 : 0) + (mob.isChampion ? 2 : 0);

			for (var i = 0; i < spellCount; i++) {
				var rune = itemGenerator.generate({
					spell: true
				});
				rune.eq = true;
				if (i == 0)
					rune.spell.cdMult = 5;
				mob.inventory.getItem(rune);
			}

			/*var rune = itemGenerator.generate({
				spell: true,
				spellName: 'crystal spikes',
				spellProperties: {
					radius: 4,
					attackTemplate: '0 x x x x x x x 0 x 1 x x x x x 1 x x x 2 x x x 2 x x x x x 3 x 3 x x x x x x x 4 x x x x x x x 3 x 3 x x x x x 2 x x x 2 x x x 1 x x x x x 1 x 0 x x x x x x x 0'
				}
			});
			rune.eq = true;
			if (i == 0)
				rune.spell.cdMult = 1;
			mob.inventory.getItem(rune);

			rune = itemGenerator.generate({
				spell: true,
				spellName: 'magic missile'
			});
			rune.eq = true;
			if (i == 0)
				rune.spell.cdMult = 1;
			mob.inventory.getItem(rune);*/

			var dmgMult = 4;
			var hpMult = 1;

			if (level < 10) {
				hpMult *= [0.005, 0.01, 0.1, 0.2, 0.5, 0.65, 0.75, 0.85, 0.95][level - 1];
				dmgMult *= [0.2, 0.45, 0.7, 0.8, 0.9, 0.92, 0.94, 0.96, 0.98][level - 1]
			}

			if (mob.isRare) {
				dmgMult *= 1.25;
				hpMult *= 1.25;
			}

			if (mob.isChampion) {
				dmgMult *= 2;
				hpMult *= 3;
			}

			statValues.hpMax *= hpMult;
			statValues.hp = statValues.hpMax;
			statValues.mana = statValues.manaMax;

			mob.spellbook.spells.forEach(function(s) {
				s.dmgMult = dmgMult;
				s.statType = preferStat;
				s.element = elementType;
				s.manaCost = 0;

				var damage = combat.getDamage({
					source: mob,
					target: mob,
					damage: (s.damage || s.healing) * (s.dmgMult || 1),
					cd: s.cdMax,
					element: s.element,
					statType: s.statType,
					statMult: s.statMult,
					noMitigate: false
				});
			}, this);

			['hp', 'hpMax', 'mana', 'manaMax', 'level'].forEach(function(s) {
				mob.syncer.setObject(false, 'stats', 'values', s, statValues[s]);
			});
		}
	};
});