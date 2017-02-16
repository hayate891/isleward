define([
	
], function(
	
) {
	return {
		type: 'cocoon',
		cocoon: null,

		persist: true,

		init: function(source) {
			var obj = this.obj;
			var syncO = obj.syncer.o;

			obj.hidden = true;
			obj.nonSelectable = true;
			syncO.hidden = true;
			syncO.nonSelectable = true;

			this.cocoon = obj.instance.objects.buildObjects([{
				name: 'cocoon',
				sheetName: 'objects',
				cell: 54,
				x: obj.x,
				y: obj.y,
				properties: {
					cpnAggro: {
						faction: source.aggro.faction
					},
					cpnStats: {
						values: {
							hpMax: 10,
							hp: 10
						}
					},
					cpnEffects: {}
				}
			}]);

			this.cocoon.effects.addEffect({
				events: {
					afterDeath: this.onDestroyCocoon.bind(this)
				}
			});
		},

		onDestroyCocoon: function() {
			this.destroyed = true;
		},

		destroy: function() {
			var obj = this.obj;
			var syncO = obj.syncer.o;

			obj.hidden = false;
			obj.nonSelectable = false;
			syncO.hidden = false;
			syncO.nonSelectable = false;

			this.cocoon.destroyed = true;
		},

		simplify: function() {
			return {
				type: 'cocoon',
				ttl: this.ttl
			};
		},

		events: {
			beforeMove: function(targetPos) {
				var obj = this.obj;

				targetPos.x = obj.x;
				targetPos.y = obj.y;
			},

			beforeDealDamage: function(damage) {
				if (damage)
					damage.failed = true;
			},

			beforeCastSpell: function(successObj) {
				successObj.success = false;
			}
		}
	};
});