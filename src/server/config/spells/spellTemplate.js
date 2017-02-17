define([
	'config/spells/spellCallbacks',
	'combat/combat'
], function(
	spellCallbacks,
	combat
) {
	return {
		cd: 0,
		cdMax: 0,
		manaCost: 1,
		threatMult: 1,
		statType: 'str',

		needLos: false,

		pendingAttacks: [],

		castBase: function() {
			if (this.cd > 0)
				return false;
			else if (this.manaCost > this.obj.stats.values.mana)
				return false;
			else
				return true;
		},

		canCast: function(target) {
			if (this.cd > 0)
				return false;
			else if (this.manaCost > this.obj.stats.values.mana)
				return false;
			else if (!target)
				return true;
			else {
				var inRange = true;
				if (this.range != null) {
					var obj = this.obj;
					var distance = Math.max(Math.abs(target.x - obj.x), Math.abs(target.y - obj.y));
					inRange = distance <= this.range;
				}

				return inRange;
			}
		},

		updateBase: function() {
			if (this.cd > 0)
				this.cd--;
		},

		calcDps: function(target, noSync) {
			if (!this.values)
				return;

			if ((!this.damage) && (!this.healing))
				delete this.values.dps;
			else {
				var noMitigate = !target;

				var dmg = combat.getDamage({
					source: this.obj,
					target: (target || {
						stats: {
							values: {}
						}
					}),
					damage: (this.damage || this.healing) * (this.dmgMult || 1),
					cd: this.cdMax,
					element: this.element,
					statType: this.statType,
					statMult: this.statMult,
					noMitigate: noMitigate,
					noCrit: true
				}).amount;

				var critChance = this.obj.stats.values.critChance;

				dmg = ((dmg / 100) * (100 - critChance)) + (((dmg / 100) * critChance) * 1.5);

				if (this.damage) {
					this.values.dmg = ~~(dmg * 10) / 10 + '/tick';
				}
				else
					this.values.heal = ~~(dmg * 10) / 10 + '/tick';

				if (!noSync)
					this.obj.syncer.setArray(true, 'spellbook', 'getSpells', this.simplify());
			}
		},

		sendAnimation: function(blueprint) {
			this.obj.instance.syncer.queue('onGetObject', blueprint);
		},

		sendBump: function(target) {
			var x = this.obj.x;
			var y = this.obj.y;

			var tx = target.x;
			var ty = target.y;

			var deltaX = 0;
			var deltaY = 0;

			if (tx < x)
				deltaX = -1;
			else if (tx > x)
				deltaX = 1;

			if (ty < y)
				deltaY = -1;
			else if (ty > y)
				deltaY = 1;

			var components = [{
				type: 'bumpAnimation',
				deltaX: deltaX,
				deltaY: deltaY
			}];

			if (this.animation) {
				components.push({
					type: 'animation',
					template: this.animation
				});
			}

			this.obj.instance.syncer.queue('onGetObject', {
				id: this.obj.id,
				components: components
			});
		},

		simplify: function(self) {
			var values = {};
			for (var p in this) {
				var value = this[p];
				if ((typeof(value) == 'function') || (p == 'obj'))
					continue;

				values[p] = value;
			}

			if (this.animation)
				values.animation = this.animation.name;
			if (this.values)
				values.values = this.values;

			return values;
		},

		getDamage: function(target, noMitigate) {
			var damage = combat.getDamage({
				source: this.obj,
				target: target,
				damage: (this.damage || this.healing) * (this.dmgMult || 1),
				cd: this.cdMax,
				element: this.element,
				statType: this.statType,
				statMult: this.statMult,
				noMitigate: noMitigate
			});

			return damage;
		},

		queueCallback: function(callback, delay, destroyCallback, target, destroyOnRezone) {
			return this.obj.spellbook.registerCallback(this.obj.id, callback, delay, destroyCallback, target ? target.id : null, destroyOnRezone);
		},

		die: function() {
			this.obj.spellbook.unregisterCallback(this.obj.id);
		}
	};
});