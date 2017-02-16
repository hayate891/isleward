define([
	'js/system/events'
], function(
	events
) {
	return {
		type: 'inventory',

		items: [],

		init: function(blueprint) {
			this.items.forEach(function(i) {
				if ((i.stats) && (i.stats.hpMax)) {
					i.stats.vit = i.stats.hpMax;
					delete i.stats.hpMax;
				}
			});

			events.emit('onGetItems', this.items);
		},
		extend: function(blueprint) {
			if (blueprint.destroyItems)
				events.emit('onDestroyItems', blueprint.destroyItems);
			
			if (blueprint.getItems) {
				var items = this.items;
				var newItems = blueprint.getItems || [];
				var nLen = newItems.length;

				for (var i = 0; i < nLen; i++) {
					var nItem = newItems[i];
					var nId = nItem.id;

					if ((nItem.stats) && (nItem.stats.hpMax)) {
						nItem.stats.vit = nItem.stats.hpMax;
						delete nItem.stats.hpMax;
					}

					var findItem = items.find(function(item) {
						return (item.id == nId);
					});
					if (findItem) {
						if (!nItem.eq)
							delete findItem.eq;
						if (nItem.stats)
							delete findItem.stats;
						if (!nItem.power)
							delete findItem.power;
						$.extend(true, findItem, nItem);

						newItems.splice(i, 1);
						i--;
						nLen--;
					} else
						nItem.isNew = true;
				}

				this.items.push.apply(this.items, blueprint.getItems || []);

				events.emit('onGetItems', this.items);
			}
		}
	};
});