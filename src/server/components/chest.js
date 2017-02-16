define([

], function(

) {
	return {
		type: 'chest',

		ownerId: -1,

		ttl: -1,

		init: function(blueprint) {
			if (blueprint.ownerId != null) 
				this.ownerId = blueprint.ownerId;

			if (this.ownerId != null)
				this.ttl = 600;
		},

		simplify: function(self) {
			return {
				type: 'chest',
				ownerId: this.ownerId
			};
		},

		update: function() {
			if (this.ttl > 0) {
				this.ttl--;

				if (this.ttl == 0)
					this.obj.destroyed = true;
			}
		},

		collisionEnter: function(obj) {
			if (!obj.player)
				return;

			var ownerId = this.ownerId;
			if (ownerId != -1) {
				if (ownerId instanceof Array) {
					if (ownerId.indexOf(obj.serverId) == -1)
						return;
				}
				else if (ownerId != obj.serverId)
					return;
			}

			//Make sure the player took all the items
			// since maybe he doesn't have enough space for everything
			if (this.obj.inventory.giveItems(obj))
				this.obj.destroyed = true;
		}
	};
});