define([
	'js/system/events'
], function(
	events
) {
	return {
		type: 'trade',

		itemList: null,
		action: 'buy',

		init: function(blueprint) {

		},

		extend: function(blueprint) {
			var redraw = false;

			if (blueprint.buyList) {
				this.itemList = blueprint.buyList;
				redraw = true;
				this.action = 'buy';
				if (blueprint.buyList.buyback)
					this.action = 'buyback';
				
				delete blueprint.buyList;
			}
			else if (blueprint.sellList) {
				this.itemList = blueprint.sellList;
				redraw = true;
				this.action = 'sell';
				delete blueprint.sellList;
			}

			if (blueprint.removeItems) {
				this.itemList.items.spliceWhere(function(b) {
					return (blueprint.removeItems.indexOf(b.id) > -1);
				});
				redraw = true;
				delete blueprint.removeItems;
			}

			for (var p in blueprint) {
				this[p] = blueprint[p];
			}

			if (redraw)
				events.emit('onGetTradeList', this.itemList, this.action);
		}
	};
});