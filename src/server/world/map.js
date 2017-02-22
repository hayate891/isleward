define([
	'objects/objects',
	'world/physics',
	'world/spawners',
	'world/resourceSpawner',
	'config/zoneBase',
	'world/randomMap'
], function(
	objects,
	physics,
	spawners,
	resourceSpawner,
	globalZone,
	randomMap
) {
	var mapFile = null;
	var mapscale = 38;
	var padding = null;

	var map = {
		name: null,
		layers: [],

		mapFile: null,

		size: {
			w: 0,
			h: 0
		},

		instanced: false,
		custom: null,

		collisionMap: null,

		clientMap: null,
		oldLayers: {
			tiles: null,
			walls: null,
			doodads: null
		},

		objBlueprints: [],

		spawn: {
			x: 0,
			y: 0
		},

		rooms: [],
		hiddenRooms: [],

		hiddenWalls: null,
		hiddenTiles: null,

		zone: null,

		init: function(args) {
			this.name = args.name;

			try {
				this.zone = require('../config/maps/' + this.name + '/zone');
			} catch (e) {
				this.zone = globalZone;
			}

			var chats = null;
			try {
				chats = require('../config/maps/' + this.name + '/chats');
			} catch (e) {}
			if (chats)
				this.zone.chats = chats;

			var dialogues = null;
			try {
				dialogues = require('../config/maps/' + this.name + '/dialogues');
			} catch (e) {}
			if (dialogues)
				this.zone.dialogues = dialogues;

			this.zone = extend(true, {}, globalZone, this.zone);

			var resources = this.zone.resources || {};
			for (var r in resources) {
				resourceSpawner.register(r, resources[r]);
			}

			mapFile = require('../config/maps/' + this.name + '/map');
			this.mapFile = mapFile;
			this.mapFile.properties = this.mapFile.properties || {};
			mapScale = mapFile.tilesets[0].tileheight;

			this.instanced = mapFile.properties.instanced;
			this.custom = mapFile.properties.custom;
			if (this.instanced)
				this.instanced = (this.instanced == '1');

			if (mapFile.properties.spawn)
				this.spawn = JSON.parse(mapFile.properties.spawn);
		},
		create: function() {
			this.getMapFile();

			this.clientMap = {
				zoneId: -1,
				map: this.layers,
				hiddenWalls: this.hiddenWalls,
				hiddenTiles: this.hiddenTiles,
				collisionMap: this.collisionMap,
				clientObjects: this.objBlueprints,
				padding: padding,
				hiddenRooms: this.hiddenRooms
			};
		},
		getMapFile: function() {
			this.build();

			randomMap = extend(true, {}, randomMap);
			this.oldMap = this.layers;
			randomMap.templates = extend(true, [], this.rooms);
			randomMap.generateMappings(this);

			for (var i = 0; i < this.size.w; i++) {
				var row = this.layers[i];
				for (var j = 0; j < this.size.h; j++) {
					var cell = row[j];
					if (!cell)
						continue;

					cell = cell.split(',');
					var cLen = cell.length;

					var newCell = '';
					for (var k = 0; k < cLen; k++) {
						var c = cell[k];
						var newC = randomMap.randomizeTile(c);
						newCell += newC;

						//Wall?
						if ((c >= 160) && (c <= 352) && (newC == 0)) {
							this.collisionMap[i][j] = 0;
						}

						if (k < cLen - 1)
							newCell += ',';
					}

					if (this.hiddenWalls[i][j])
						this.hiddenWalls[i][j] = randomMap.randomizeTile(this.hiddenWalls[i][j]);
					if (this.hiddenTiles[i][j])
						this.hiddenTiles[i][j] = randomMap.randomizeTile(this.hiddenTiles[i][j]);

					row[j] = newCell;
				}
			}

			randomMap.templates
				.filter(r => r.properties.mapping)
				.forEach(function(m) {
					var x = m.x;
					var y = m.y;
					var w = m.width;
					var h = m.height;

					for (var i = x; i < x + w; i++) {
						var row = this.layers[i];

						for (var j = y; j < y + h; j++) {
							row[j] = '';
						}
					}
				}, this);

			physics.init(this.collisionMap);

			padding = mapFile.properties.padding;

			mapFile = null;

			console.log('(M ' + this.name + '): Ready');
		},

		build: function() {
			this.size.w = mapFile.width;
			this.size.h = mapFile.height;

			this.layers = _.get2dArray(this.size.w, this.size.h, null);
			this.hiddenWalls = _.get2dArray(this.size.w, this.size.h, null);
			this.hiddenTiles = _.get2dArray(this.size.w, this.size.h, null);

			this.oldLayers.tiles = _.get2dArray(this.size.w, this.size.h, 0);
			this.oldLayers.walls = _.get2dArray(this.size.w, this.size.h, 0);
			this.oldLayers.objects = _.get2dArray(this.size.w, this.size.h, 0);

			var builders = {
				tile: this.builders.tile.bind(this),
				object: this.builders.object.bind(this)
			};

			this.collisionMap = _.get2dArray(this.size.w, this.size.h);

			//Rooms need to be ahead of exits
			mapFile.layers.rooms = (mapFile.layers.rooms || [])
				.sort(function(a, b) {
					if ((a.exit) && (!b.exit))
						return 1;
					else
						return 0;
				});

			for (var i = 0; i < mapFile.layers.length; i++) {
				var layer = mapFile.layers[i];
				var layerName = layer.name;
				if (!layer.visible)
					continue;

				var data = layer.data || layer.objects;

				var len = data.length;
				for (var j = 0; j < len; j++) {
					var cell = data[j];

					if ((cell.gid) || (cell.id))
						builders.object(layerName, cell, j);
					else
						builders.tile(layerName, cell, j);
				}
			}
		},
		builders: {
			getCellInfo: function(cell) {
				var flipX = null;

				if ((cell ^ 0x80000000) > 0) {
					flipX = true;
					cell = cell ^ 0x80000000;
				}

				var firstGid = 0;
				var sheetName = null;
				for (var s = 0; s < mapFile.tilesets.length; s++) {
					var tileset = mapFile.tilesets[s];
					if (tileset.firstgid <= cell) {
						sheetName = tileset.name;
						firstGid = tileset.firstgid;
					}
				}

				cell = cell - firstGid + 1;

				return {
					sheetName: sheetName,
					cell: cell,
					flipX: flipX
				};
			},
			tile: function(layerName, cell, i) {
				var y = ~~(i / this.size.w);
				var x = i - (y * this.size.w);

				if (cell == 0) {
					if (layerName == 'tiles')
						this.collisionMap[x][y] = 1;

					return;
				}

				var cellInfo = this.builders.getCellInfo(cell);
				var sheetName = cellInfo.sheetName;
				var cell = cellInfo.cell;
				if (sheetName == 'walls')
					cell += 192;
				else if (sheetName == 'objects')
					cell += 384;

				if ((layerName != 'hiddenWalls') && (layerName != 'hiddenTiles')) {
					var layer = this.layers;
					if (this.oldLayers[layerName])
						this.oldLayers[layerName][x][y] = cell;
					layer[x][y] = (layer[x][y] == null) ? cell : layer[x][y] + ',' + cell;
				}
				else if (layerName == 'hiddenWalls')
					this.hiddenWalls[x][y] = cell;
				else if (layerName == 'hiddenTiles')
					this.hiddenTiles[x][y] = cell;

				if (layerName.indexOf('walls') > -1)
					this.collisionMap[x][y] = 1;
				else if (sheetName.toLowerCase().indexOf('tiles') > -1) {
					if ((cell == 6) || (cell == 7) || (cell == 54) || (cell == 55) || (cell == 62) || (cell == 63) || (cell == 154))
						this.collisionMap[x][y] = 1;
				}
			},
			object: function(layerName, cell, i) {
				var clientObj = (layerName == 'clientObjects');
				var cellInfo = this.builders.getCellInfo(cell.gid);

				var name = (cell.name || '');
				var objZoneName = name;
				if (name.indexOf('|') > -1) {
					var split = name.split('|');
					name = split[0];
					objZoneName = split[1];
				}

				var blueprint = {
					clientObj: clientObj,
					sheetName: cellInfo.sheetName,
					cell: cellInfo.cell - 1,
					x: cell.x / mapScale,
					y: (cell.y / mapScale) - 1,
					name: name,
					properties: cell.properties || {}
				};

				if ((this.zone) && (this.zone.objects) && (this.zone.objects[objZoneName.toLowerCase()]))
					extend(true, blueprint, this.zone.objects[objZoneName.toLowerCase()]);

				if ((blueprint.properties.cpnNotice) || (layerName == 'rooms') || (layerName == 'hiddenRooms')) {
					blueprint.y++;
					blueprint.width = cell.width / mapScale;
					blueprint.height = cell.height / mapScale;
				} else if (cell.width == 24)
					blueprint.x++;

				if (layerName == 'rooms') {
					if (blueprint.properties.exit) {
						var room = this.rooms.find(function(r) {
							return (!(
								(blueprint.x + blueprint.width < r.x) ||
								(blueprint.y + blueprint.height < r.y) ||
								(blueprint.x >= r.x + r.width) ||
								(blueprint.y >= r.y + r.height)
							));
						});

						room.exits.push(blueprint);
					} else {
						blueprint.exits = [];
						blueprint.objects = [];
						this.rooms.push(blueprint);
					}
				} else if (layerName == 'hiddenRooms') {
					this.hiddenRooms.push(blueprint);
				} else if (!clientObj) {
					if (!mapFile.properties.isRandom)
						spawners.register(blueprint, mapFile.properties.spawnCd);
					else {
						var room = this.rooms.find(function(r) {
							return (!(
								(blueprint.x < r.x) ||
								(blueprint.y < r.y) ||
								(blueprint.x >= r.x + r.width) ||
								(blueprint.y >= r.y + r.height)
							));
						});
						room.objects.push(blueprint);
					}
				} else {
					var obj = objects.buildObjects([blueprint], true).getSimple(true);
					this.objBlueprints.push(obj);
				}
			}
		}
	}

	return map;
});