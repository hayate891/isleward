define([
	'security/io'
], function(
	io
) {
	return {
		instance: null,
		ent: null,
		tiles: [],
		oldTiles: {},

		load: function(instance, objToAdd, callback) {
			this.instance = instance;

			this.ent = instance.zone.name + '-' + objToAdd.components.find(c => c.type == 'auth').username;

			io.get({
				ent: this.ent,
				field: 'customMap',
				callback: this.onLoad.bind(this, callback)
			});
		},

		onLoad: function(callback, result) {
			this.tiles = JSON.parse(result || '[]');
			this.build(callback);
		},

		save: function() {
			//this.tiles = [];

			io.set({
				ent: this.ent,
				field: 'customMap',
				value: JSON.stringify(this.tiles),
				callback: this.onSave.bind(this)
			});
		},
		onSave: function(result) {

		},

		build: function(callback) {
			var map = this.instance.map.clientMap.map;
			var w = map.length;
			var h = map[0].length;

			this.tiles.forEach(function(t) {
				t = t.split('|');
				this.customize(t[0], t[1], t[2], true);
			}, this);

			//this.customize(~~(Math.random() * w), ~~(Math.random() * h), 52);

			this.save();

			callback();
		},

		customize: function(x, y, tile, noStore) {
			var action = null;
			if (arguments.length == 1) {
				action = x;
				var obj = action.obj;
				tile = action.tile;
				x = obj.x;
				y = obj.y;

				if (action.destroy) {
					x += action.direction.x;
					y += action.direction.y;
				}
			}

			var collide = true;

			if (!noStore) {
				var exists = this.tiles.find(function(t) {
					t = t.split('|');
					if ((t[0] == x) && (t[1] == y))
						return true;
				});
				if (exists) {
					tile = this.oldTiles[x + '|' + y];
					collide = false;

					this.tiles.spliceWhere(t => t == exists);
				}
				//Can't build on natural collisions
				else if (this.instance.map.clientMap.collisionMap[x][y])
					return;
				else
					this.tiles.push(x + '|' + y + '|' + tile);
			}

			if ((collide) && (!this.oldTiles[x + '|' + y])) {
				var oldTile = this.instance.map.clientMap.map[x][y];
				this.oldTiles[x + '|' + y] = oldTile - 1;
			}				

			this.instance.map.clientMap.map[x][y] = tile;

			this.instance.map.clientMap.collisionMap[x][y] = collide;
			this.instance.physics.graph.grid[x][y] = !collide;

			if (!noStore)
				this.save();

			if (action)
				action.result = {
					x: x,
					y: y,
					tile: tile,
					collide: collide
				};
		},

		placeTile: function(obj) {
			this.customize(obj.x, obj.y, 52);
		}
	};
});