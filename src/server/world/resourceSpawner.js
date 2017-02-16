define([
	'config/herbs'
], function(
	herbs
) {
	return {
		nodes: [],

		objects: null,
		syncer: null,
		zone: null,
		physics: null,
		map: null,

		cdMax: 200,

		init: function(instance) {
			this.objects = instance.objects;
			this.syncer = instance.syncer;
			this.zone = instance.zone;
			this.physics = instance.physics;
			this.map = instance.map;
		},

		register: function(name, blueprint) {
			blueprint = extend(true, {}, blueprint, herbs[name], {
				name: name
			});	

			var max = blueprint.max;
			delete blueprint.max;
			delete blueprint.type;

			this.nodes.push({
				cd: 0,
				max: max,
				blueprint: blueprint,
				spawns: []
			});
		},

		spawn: function(node) {
			var blueprint = node.blueprint;

			//Get an accessible position
			var w = this.physics.width;
			var h = this.physics.height;

			var spawn = this.map.spawn;
			var x = null;
			var y = null;

			while (true) {
				x = ~~(Math.random() * w);
				y = ~~(Math.random() * h);

				if (this.physics.isTileBlocking(x, y))
					continue;
				else {
					var path = this.physics.getPath(spawn, {
						x: x,
						y: y
					});

					var endTile = path[path.length - 1];
					if (!endTile)
						continue;
					else if ((endTile.x != x) || (endTile.y != y))
						continue;
					else {
						//Don't spawn in rooms
						var cell = this.physics.getCell(x, y);
						if (cell.some(c => c.notice))
							continue;
						else {
							blueprint.x = x;
							blueprint.y = y;

							break;
						}
					}
				}
			}

			var obj = this.objects.buildObjects([node.blueprint]);

			this.syncer.queue('onGetObject', {
				x: obj.x,
				y: obj.y,
				components: [{
					type: 'attackAnimation',
					row: 0,
					col: 4
				}]
			});

			obj.addComponent('resourceNode').xp = (this.map.zone.level * this.map.zone.level);
			var inventory = obj.addComponent('inventory');
			obj.layerName = 'objects';

			node.spawns.push(obj);

			inventory.getItem({
				material: true,
				type: 'herb',
				sprite: node.blueprint.itemSprite,
				name: node.blueprint.name,
				quantity: 1,
				quality: 0
			});
		},

		update: function() {
			var nodes = this.nodes;
			var nLen = nodes.length;

			for (var i = 0; i < nLen; i++) {
				var node = nodes[i];

				var spawns = node.spawns;
				var sLen = spawns.length;

				if ((node.cd > 0) && (sLen < node.max))
					node.cd--;

				for (var j = 0; j < sLen; j++) {
					var o = spawns[j];
					if (o.destroyed) {
						spawns.splice(j, 1);
						j--;
						sLen--;
						continue;
					}
				}

				if ((sLen < node.max) && (node.cd == 0)) {
					node.cd = this.cdMax;
					this.spawn(node);
					break;
				}
			}
		}
	};
});