define([
	'world/mobBuilder'
], function(
	mobBuilder
) {
	var cSpawner = {
		cd: -1,
		cdMax: null,
		blueprint: null,
		mob: null,
		amountLeft: -1
	};

	return {
		list: [],
		mobTypes: {},

		init: function(msg) {
			this.objects = msg.objects;
			this.syncer = msg.syncer;
			this.zone = msg.zone;
			this.mobBuilder = extend(true, {
				zone: this.zone
			}, mobBuilder);
		},

		reset: function() {
			this.list = [];
			this.mobTypes = {};
		},

		register: function(blueprint, cdMax) {
			var spawner = extend(true, {
				cdMax: cdMax || 50,
				blueprint: blueprint,
				amountLeft: blueprint.amount || -1
			});

			this.list.push(spawner);

			if ((blueprint.sheetName != 'mobs') && (blueprint.sheetName != 'bosses'))
				return;

			var name = blueprint.name.toLowerCase();
			if (!this.mobTypes[name])
				this.mobTypes[name] = 1;
			else
				this.mobTypes[name]++;

			spawner.zonePrint = extend(true, {}, this.zone.mobs.default, this.zone.mobs[name] || {});
		},

		spawn: function(spawner) {
			if (spawner.amountLeft == 0)
				return;

			var blueprint = spawner.blueprint;
			var obj = this.objects.buildObjects([blueprint]);

			this.syncer.queue('onGetObject', {
				x: obj.x,
				y: obj.y,
				components: [{
					type: 'attackAnimation',
					row: 0,
					col: 4
				}]
			});

			if (spawner.amountLeft != -1)
				spawner.amountLeft--;

			return obj;
		},

		update: function() {
			var list = this.list;
			var lLen = list.length;

			for (var i = 0; i < lLen; i++) {
				var l = list[i];

				if (l.cd > 0) {
					l.cd--;
				} else if ((l.mob) && (l.mob.destroyed))
					l.cd = l.cdMax;

				var doSpawn = (
					(!l.mob) ||
					(l.cd == 0)
				);

				if (doSpawn) {
					l.cd = -1;
					var mob = this.spawn(l);
					if (!mob)
						continue;

					var name = l.blueprint.name.toLowerCase();

					if ((l.blueprint.sheetName == 'mobs') || (l.blueprint.sheetName == 'bosses'))
						this.setupMob(mob, l.zonePrint, l.blueprint.scaleDrops);
					else {
						var blueprint = extend(true, {}, this.zone.objects.default, this.zone.objects[name] || {});
						this.setupObj(mob, blueprint);
					}

					l.mob = mob;
				}
			}
		},

		scale: function(level) {
			level += (this.zone.addLevel || 0);
			this.list.forEach(function(l) {
				if (!l.zonePrint)
					return;

				if (l.zonePrint.level != null)
					l.zonePrint.level = level;

				if ((!l.mob) || (l.mob.destroyed))
					return;

				this.mobBuilder.scale(l.mob, level);
			}, this);
		},

		setupMob: function(mob, blueprint, scaleDrops) {
			var type = 'regular';
			if (blueprint.isChampion)
				type = 'champion'
			else if (blueprint.rare.count > 0) {
				var rareCount = this.list.filter(l => (
					(l.mob) &&
					(!l.mob.destroyed) &&
					(l.mob.isRare) &&
					(l.mob.baseName == mob.name)
				));
				if (rareCount.length < blueprint.rare.count) {
					var roll = Math.random() * 100;
					if (roll < blueprint.rare.chance)
						type = 'rare';
				}
			}

			this.mobBuilder.build(mob, blueprint, scaleDrops, type);
		},

		setupObj: function(obj, blueprint) {
			var cpns = blueprint.components;
			if (!cpns)
				return;

			for (var c in cpns) {
				var cpn = cpns[c];

				var cType = c.replace('cpn', '');
				cType = cType[0].toLowerCase() + cType.substr(1);

				var builtCpn = obj.addComponent(cType, cpn);

				if (cpn.simplify)
					builtCpn.simplify = cpn.simplify.bind(builtCpn);

			}
		}
	};
});