define([
	'server/mocks/generator'
], function(
	mocks
) {
	return {
		//Does the item exist in the stash after stashing it
		stashItem_Exists: function() {
			var player = mocks.player({
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

		//Does the stashed item have the correct quantity
		stashItem_Quantity: function() {
			var player = mocks.player({
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