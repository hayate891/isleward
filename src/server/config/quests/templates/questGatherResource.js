define([
	'items/generators/slots'
], function(
	slots
) {
	return {
		type: 'gatherResource',

		need: null,
		have: 0,

		build: function() {
			if (!this.need) {
				this.need = 2 + ~~(Math.random() * 3);
			}

			this.description = 'Gather ' + this.have + '/' + this.need + ' herbs';
		},

		events: {
			afterGatherResource: function(item) {
				if ((this.obj.zoneName != this.zoneName) || (this.have >= this.need))
					return;

				this.have++;
				this.description = 'Gather ' + this.have + '/' + this.need + ' herbs';

				this.obj.syncer.setArray(true, 'quests', 'updateQuests', this.simplify(true));

				if (this.have >= this.need)
					this.ready();
			}
		}
	};
});