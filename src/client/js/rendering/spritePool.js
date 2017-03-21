define([
	
], function(
	
) {
	return {
		pool: {},

		clean: function() {
			this.pool = {};
		},

		getSprite: function(type) {
			var list = this.pool[type];
			if (!list)
				return null;
			else if (list.length == 0)
				return null;
			else
				return list.pop();
		},

		store: function(sprite) {
			var pool = this.pool;
			var type = sprite.type;
			if (sprite.scale.x < 0)
				type = 'flip' + type;
			var list = pool[type];
			if (!list) {
				list = pool[type] = [];
			}

			list.push(sprite);
		}
	};
});