define([
	'js/system/events'
], function(
	events
) {
	return {
		type: 'stash',

		active: false,

		items: null,

		init: function() {
			events.emit('onGetStashItems', this.items);
		},

		extend: function(blueprint) {
			if (blueprint.active != null)
				this.active = blueprint.active;

			if (blueprint.getItems) {
				var items = this.items;
				var newItems = blueprint.getItems || [];
				var nLen = newItems.length;

				for (var i = 0; i < nLen; i++) {
					var nItem = newItems[i];
					var nId = nItem.id;

					var findItem = items.find(function(item) {
						return (item.id == nId);
					});
					if (findItem) {
						$.extend(true, findItem, nItem);

						newItems.splice(i, 1);
						i--;
						nLen--;
					}
				}

				this.items.push.apply(this.items, blueprint.getItems || []);

				events.emit('onGetStashItems', this.items);
			}

			if (blueprint.destroyItems) {
				events.emit('onDestroyStashItems', blueprint.destroyItems);
			}
		}
	};
});