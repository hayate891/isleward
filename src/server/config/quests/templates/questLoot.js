define([
	'items/config/slots'
], function(
	slots
) {
	return {
		slot: null,

		type: 'loot',

		build: function() {
			if (!this.slot) {
				var slotNames = slots.slots;
				this.slot = slotNames.filter(s => (s != 'tool'));
				this.slot = slotNames[~~(Math.random() * slotNames.length)];
				this.slotName = this.slot[0].toUpperCase() + this.slot.substr(1);
			}

			this.description = 'Loot 1x ' + this.slotName + ' slot item';
		},

		events: {
			afterLootMobItem: function(item) {
				if ((this.obj.zoneName != this.zoneName) || (item.slot != this.slot))
					return;

				this.ready();
			}
		}
	};
});