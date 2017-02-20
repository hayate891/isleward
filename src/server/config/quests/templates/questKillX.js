define([

], function(

) {
	return {
		need: 10,
		have: 0,

		mobType: null,

		type: 'killX',

		build: function() {
			if (!this.mobName) {
				var mobTypes = this.obj.instance.spawners.zone.mobs;
				var mobCounts = this.obj.instance.spawners.mobTypes;
				var keys = Object.keys(mobTypes).filter(function(m) {
					return (m != 'default');
				});
				this.mobType = keys[~~(Math.random() * keys.length)];
				var needMax = 8;
				this.mobName = this.mobType.replace(/\w\S*/g, function(txt) {
					return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
				});

				this.need = Math.max(1, ~~((needMax * 0.2) + (Math.random() * needMax * 0.8)));
			}

			this.description = 'Kill ' + this.have + '/' + this.need + ' ' + this.mobName;
		},

		events: {
			afterKillMob: function(mob) {
				if ((mob.name != this.mobName) || (this.have >= this.need))
					return;

				this.have++;
				this.description = 'Kill ' + this.have + '/' + this.need + ' ' + this.mobName;

				if (this.have >= this.need)
					this.ready();

				this.obj.syncer.setArray(true, 'quests', 'updateQuests', this.simplify(true));
			}
		}
	};
});