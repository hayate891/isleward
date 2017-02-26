define([
	'server/mocks/generator'
], function(
	mocks
) {
	return {
		stashItemExists: function() {
			var player = mocks.generate({
				inventory: {
					items: [{
						id: 0
					}]
				},
				stash: {
					active: true
				}
			});

			player.inventory.stashItem(0);

			var stashedItem = player.stash.items.find(i => (i.id == 0))
			if (!stashedItem)
				return true;
		},
		stashItemQuantity: function() {
			var player = mocks.generate({
				inventory: {
					items: [{
						id: 0,
						quantity: 10
					}]
				},
				stash: {
					active: true
				}
			});

			player.inventory.stashItem(0);

			var stashedItem = player.stash.items.find(i => (i.id == 0))
			if (stashedItem.quantity != 10)
				return true;
		}
	};
});