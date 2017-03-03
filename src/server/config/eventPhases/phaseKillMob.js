define([
	
], function(
	
) {
	var cpnDeathStopper = {
		type: 'deathStopper',
		percentage: 0,
		end: false,

		events: {
			beforeTakeDamage: function(damage, source) {
				var statValues = this.obj.stats.values;
				var minHp = statValues.hpMax * this.percentage;
				if (statValues.hp - damage.amount < minHp) {
					this.end = true;
					damage.amount = Math.max(0, statValues.hp - minHp);
				}
			}
		}
	};

	return {
		mobs: null,

		init: function() {
			if (!this.mobs.push)
				this.mobs = [ this.mobs ];

			var mobs = this.mobs;
			var percentage = this.percentage;

			var objects = this.instance.objects.objects;
			var oLen = objects.length;
			for (var i = 0; i < oLen; i++) {
				var o = objects[i];
				var index = mobs.indexOf(o.id);
				if (index == -1)
					continue;

				if (percentage) {
					var cpn = extend(true, cpnDeathStopper, {
						percentage: percentage
					});
					o.components.push(cpn);
					cpn.obj = o;
				}

				mobs.splice(index, 1, o);
			}
		},

		update: function() {
			var mobs = this.mobs;
			var mLen = mobs.length;
			for (var i = 0; i < mLen; i++) {
				var m = mobs[i];
				var destroyed = m.destroyed;
				if (!destroyed) {
					var deathStopper = m.components.find(c => (c.type == 'deathStopper'));
					if (deathStopper)
						destroyed = deathStopper.end;
				}

				if (destroyed) {
					mobs.splice(i, 1);
					mLen--;
					i--;
				}
			}

			if (mobs.length == 0)
				this.end = true;
		}	
	};
});