define([

], function(

) {
	return {
		type: 'stash',

		active: false,
		items: [],
		changed: false,

		init: function(blueprint) {
			var items = blueprint.items || [];
			var iLen = items.length;
			for (var i = 0; i < iLen; i++) {
				this.getItem(items[i]);
			}

			delete blueprint.items;

			this.blueprint = blueprint;
		},

		getItem: function(item) {
			//Material?
			var exists = false;
			if ((item.material) || (item.quest)) {
				var existItem = this.items.find(i => i.name == item.name);
				if (existItem) {
					exists = true;
					if (!existItem.quantity)
						existItem.quantity = 1;
					existItem.quantity += item.quantity;

					//We modify the old object because it gets sent to the client
					item.id = existItem.id;
					item.quantity = existItem.quantity;

					item = existItem;
				}
			}

			//Get next id
			if (!exists) {
				var id = 0;
				var items = this.items;
				var iLen = items.length;
				for (var i = 0; i < iLen; i++) {
					var fItem = items[i];
					if (fItem.id >= id) {
						id = fItem.id + 1;
					}
				}
				item.id = id;
			}

			if (!exists)
				this.items.push(item);
		},

		deposit: function(item) {
			if (!this.active)
				return;

			this.getItem(item);

			this.obj.syncer.setArray(true, 'stash', 'getItems', item);

			this.changed = true;
		},

		withdraw: function(id) {
			if (!this.active)
				return;
			
			var item = this.items.find(i => i.id == id);
			if (!item)
				return;

			this.obj.inventory.getItem(item);
			this.items.spliceWhere(i => i == item);

			this.obj.syncer.setArray(true, 'stash', 'destroyItems', id);

			this.changed = true;
		},

		setActive: function(active) {
			this.active = active;
			this.obj.syncer.set(true, 'stash', 'active', this.active);
		},

		simplify: function(self) {
			if (!self)
				return null;

			return {
				type: 'stash',
				active: this.active,
				items: this.items
			};
		}
	};
});