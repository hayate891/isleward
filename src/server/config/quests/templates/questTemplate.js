define([

], function(

) {
	return {
		init: function(hideMessage) {
			if (!this.build())
				return false;

			this.obj.syncer.setArray(true, 'quests', 'obtainQuests', this.simplify(true));

			if (!hideMessage) {
				this.obj.instance.syncer.queue('onGetMessages', {
					id: this.obj.id,
					messages: [{
						class: 'q0',
						message: 'quest obtained (' + this.name + ')'
					}]
				}, [this.obj.serverId]);
			}

			return true;
		},

		ready: function() {
			this.isReady = true;

			if (this.oReady)
				this.oReady();

			this.obj.instance.syncer.queue('onGetMessages', {
				id: this.obj.id,
				messages: [{
					class: 'q0',
					message: 'quest ready for turn-in (' + this.name + ')'
				}]
			}, [this.obj.serverId]);

			this.obj.syncer.setArray(true, 'quests', 'updateQuests', this.simplify(true));
		},

		complete: function() {
			if (this.oComplete)
				this.oComplete();

			this.obj.instance.syncer.queue('onGetMessages', {
				id: this.obj.id,
				messages: [{
					class: 'q0',
					message: 'quest completed (' + this.name + ')'
				}]
			}, [this.obj.serverId]);

			this.obj.syncer.setArray(true, 'quests', 'completeQuests', this.id);

			this.obj.stats.getXp(this.xp || 10);
		},

		simplify: function(self) {
			var values = {};
			for (var p in this) {
				var value = this[p];
				if ((typeof(value) == 'function') || (p == 'obj'))
					continue;

				values[p] = value;
			}

			return values;
		}
	};
});