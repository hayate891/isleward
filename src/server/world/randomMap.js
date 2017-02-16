define([

], function(

) {
	return {
		templates: null,
		tileMappings: {},
		gapMappings: {},
		rooms: [],
		exitAreas: [],

		maxDistance: 14,
		minDistance: 0,

		bounds: [0, 0, 0, 0],

		generate: function(instance) {
			this.rooms = [];
			this.exitAreas = [];
			this.tileMappings = {};
			this.bounds = [0, 0, 0, 0];
			this.templates = extend(true, [], instance.map.rooms);

			this.setupTemplates(instance.map);
			this.generateMappings(instance.map);

			var startTemplate = this.templates.filter(t => t.properties.start);
			startTemplate = startTemplate[this.randInt(0, startTemplate.length)];

			var startRoom = this.buildRoom(startTemplate);

			if (!this.isValidDungeon())
				this.generate(instance);
			else {
				this.offsetRooms(startRoom);
				this.buildMap(instance, startRoom);
			}
		},

		isValidDungeon: function() {
			var endRooms = this.rooms.filter(r => r.connections.length == 0);
			var endDistanceReached = endRooms.find(r => r.distance == this.maxDistance, this);

			if (!endDistanceReached)
				return false;

			var valid = true;

			endRooms
				.forEach(function(r) {
					if (r.distance < this.minDistance)
						valid = false;
					else if (r.distance > this.maxDistance)
						valid = false;
				}, this);

			return valid;
		},

		setupTemplates: function(map) {
			this.templates.forEach(function(r, typeId) {
				if (r.properties.mapping)
					return;

				r.typeId = typeId;

				for (var i = 0; i < 2; i++) {
					for (var j = 0; j < 2; j++) {
						for (var k = 0; k < 2; k++) {
							if (i + j + k == 0)
								continue;

							var flipped = extend(true, {
								flipX: !!i,
								flipY: !!j,
								rotate: !!k
							}, r);

							flipped.exits.forEach(function(e) {
								var direction = JSON.parse(e.properties.exit);

								if (flipped.flipX) {
									direction[0] *= -1;
									e.x = r.x + r.width - (e.x - r.x) - e.width;
								}
								if (flipped.flipY) {
									direction[1] *= -1;
									e.y = r.y + r.height - (e.y - r.y) - e.height;
								}
								if (flipped.rotate) {
									direction = [direction[1], direction[0]];
									var t = e.x;
									e.x = r.x + (e.y - r.y);
									e.y = r.y + (t - r.x);
									t = e.width;
									e.width = e.height;
									e.height = t;
								}

								e.properties.exit = JSON.stringify(direction);
							});

							flipped.objects.forEach(function(o) {
								if (flipped.flipX)
									o.x = r.x + r.width - (o.x - r.x) - 1;
								if (flipped.flipY)
									o.y = r.y + r.height - (o.y - r.y) - 1;
								if (flipped.rotate) {
									var t = o.x;
									o.x = r.x + (o.y - r.y);
									o.y = r.y + (t - r.x);
								}
							});

							if (flipped.rotate) {
								var t = flipped.width;
								flipped.width = flipped.height;
								flipped.height = t;
							}

							this.templates.push(flipped);
						}
					}
				}
			}, this);

			this.templates.forEach(function(r) {
				var rotate = r.rotate;
				var w = rotate ? r.height : r.width;
				var h = rotate ? r.width : r.height;

				r.map = _.get2dArray(r.width, r.height);
				r.tiles = _.get2dArray(r.width, r.height);
				r.collisionMap = _.get2dArray(r.width, r.height);
				r.oldExits = extend(true, [], r.exits);

				for (var i = 0; i < w; i++) {
					for (var j = 0; j < h; j++) {
						var ii = rotate ? j : i;
						var jj = rotate ? i : j;

						var x = r.flipX ? (r.x + w - i - 1) : (r.x + i);
						var y = r.flipY ? (r.y + h - j - 1) : (r.y + j);

						r.map[ii][jj] = map.oldMap[x][y];
						r.tiles[ii][jj] = map.oldLayers.tiles[x][y];
						r.collisionMap[ii][jj] = map.oldCollisionMap[x][y];
					}
				}
			});
		},

		generateMappings: function(map) {
			var oldMap = map.oldMap;

			this.templates
				.filter(r => r.properties.mapping)
				.forEach(function(m) {
					var x = m.x;
					var y = m.y;
					var w = m.width;
					var h = m.height;

					var baseTile = oldMap[x][y];
					baseTile = baseTile
						.replace('0,', '')
						.replace(',', '');

					var mapping = null;

					if ((!m.properties.wall) && (!m.properties.floor))
						mapping = this.tileMappings[baseTile] = [];
					else
						mapping = this.gapMappings[baseTile] = [];

					for (var i = x + 2; i < x + w; i++) {
						for (var j = y; j < y + h; j++) {
							var oM = oldMap[i][j];
							if (oM.replace) {
								oM = oM
									.replace('0,', '')
									.replace(',', '');
							}

							mapping.push(oM);
						}
					}
				}, this);
		},

		buildMap: function(instance, startRoom) {
			var w = this.bounds[2] - this.bounds[0];
			var h = this.bounds[3] - this.bounds[1];

			var map = instance.map;
			var clientMap = map.clientMap;

			clientMap.map = _.get2dArray(w, h);
			clientMap.collisionMap = _.get2dArray(w, h);

			var startTemplate = startRoom.template;
			map.spawn.x = startRoom.x + ~~(startTemplate.width / 2);
			map.spawn.y = startRoom.y + ~~(startTemplate.height / 2);

			this.drawRoom(instance, startRoom);

			this.fillGaps(instance);

			instance.physics.init(clientMap.collisionMap);

			this.spawnObjects(instance, startRoom);
		},

		fillGaps: function(instance) {
			var map = instance.map.clientMap.map;
			var oldMap = instance.map.oldMap;
			var w = map.length;
			var h = map[0].length;
			var len = w * h / 120;

			var floorTile = this.templates.find(t => t.properties.floor);
			floorTile = oldMap[floorTile.x][floorTile.y];
			var wallTile = this.templates.find(t => t.properties.wall);
			wallTile = oldMap[wallTile.x][wallTile.y];

			for (var i = 0; i < len; i++) {
				var xMin = this.randInt(0, w);
				var yMin = this.randInt(0, h);
				var xMax = Math.min(w, xMin + this.randInt(2, 7));
				var yMax = Math.min(h, yMin + this.randInt(2, 7));

				for (var x = xMin; x < xMax; x++) {
					for (var y = yMin; y < yMax; y++) {
						if (map[x][y])
							continue;

						if (this.randInt(0, 10) < 6) {
							if (this.randInt(0, 10) < 3)
								map[x][y] = this.randomizeTile(wallTile, null, true);
							else
								map[x][y] = this.randomizeTile(floorTile, null, true);
						}
					}
				}
			}
		},

		randomizeTile: function(tile, floorTile, gapMapping) {
			var mapping = gapMapping ? this.gapMappings[tile] : this.tileMappings[tile];
			if (!mapping)
				return tile;

			tile = mapping[this.randInt(0, mapping.length)];
			if (!tile) {
				if (floorTile)
					return this.randomizeTile(floorTile);
				else
					return 0;
			}

			return tile;
		},

		drawRoom: function(instance, room) {
			var map = instance.map.clientMap.map;
			var template = room.template;
			var collisionMap = instance.map.clientMap.collisionMap;

			for (var i = 0; i < template.width; i++) {
				var x = room.x + i;
				for (var j = 0; j < template.height; j++) {
					var y = room.y + j;

					var tile = template.map[i][j];
					if (!tile)
						continue;

					var currentTile = map[x][y];
					var collides = template.collisionMap[i][j];
					var floorTile = template.tiles[i][j];

					if (!currentTile) {
						map[x][y] = this.randomizeTile(tile, floorTile);
						collisionMap[x][y] = collides;
						continue;
					} else {
						//Remove objects from this position since it falls in another room
						template.objects.spliceWhere(function(o) {
							var ox = o.x - template.x + room.x;
							var oy = o.y - template.y + room.y;
							return ((ox == x) && (oy == y));
						});
					}

					var didCollide = collisionMap[x][y];
					if (collides) {
						if (didCollide) {
							var isExitTile = this.exitAreas.find(function(e) {
								return (!((x < e.x) || (y < e.y) || (x >= e.x + e.width) || (y >= e.y + e.height)));
							});
							if (isExitTile) {
								var isThisExit = template.oldExits.find(function(e) {
									var ex = room.x + (e.x - template.x);
									var ey = room.y + (e.y - template.y);
									return (!((x < ex) || (y < ey) || (x >= ex + e.width) || (y >= ey + e.height)));
								});
								if (isThisExit) {
									map[x][y] = this.randomizeTile(floorTile);
									collisionMap[x][y] = false;
								} else
									collisionMap[x][y] = true;
							}
						}
					} else if (didCollide) {
						collisionMap[x][y] = false;
						map[x][y] = this.randomizeTile(floorTile);
					}
				}
			}

			template.oldExits.forEach(function(e) {
				this.exitAreas.push({
					x: room.x + (e.x - template.x),
					y: room.y + (e.y - template.y),
					width: e.width,
					height: e.height
				});
			}, this);

			room.connections.forEach(c => this.drawRoom(instance, c), this);
		},

		spawnObjects: function(instance, room) {
			var template = room.template;
			var spawners = instance.spawners;
			var spawnCd = instance.map.mapFile.properties.spawnCd;

			var collisionMap = instance.map.clientMap.collisionMap;

			template.objects.forEach(function(o) {
				o.x = o.x - template.x + room.x;
				o.y = o.y - template.y + room.y;

				o.amount = 1;

				o.scaleDrops = true;

				spawners.register(o, spawnCd);
			});

			room.connections.forEach(c => this.spawnObjects(instance, c), this);
		},

		buildRoom: function(template, connectTo, templateExit, connectToExit, isHallway) {
			var room = {
				x: 0,
				y: 0,
				distance: 0,
				isHallway: isHallway,
				template: extend(true, {}, template),
				connections: []
			};

			if (connectTo) {
				room.x = connectTo.x + connectToExit.x - connectTo.template.x + (template.x - templateExit.x);
				room.y = connectTo.y + connectToExit.y - connectTo.template.y + (template.y - templateExit.y);
				room.distance = connectTo.distance + 1;
				room.parent = connectTo;
			}

			if (this.doesCollide(room, connectTo))
				return false;

			if (connectTo)
				connectTo.connections.push(room);

			this.rooms.push(room);

			this.updateBounds(room);

			if (room.distance < this.maxDistance) {
				var count = this.randInt(1, room.template.exits.length);
				for (var i = 0; i < count; i++) {
					this.setupConnection(room, !isHallway);
				}
			}

			if ((isHallway) && (room.connections.length == 0)) {
				this.rooms.spliceWhere(r => r == room);
				room.parent.connections.spliceWhere(c => c == room);
				return false;
			}

			return room;
		},

		setupConnection: function(fromRoom, isHallway) {
			if (fromRoom.template.exits.length == 0)
				return true;

			var fromExit = fromRoom.template.exits.splice(this.randInt(0, fromRoom.template.exits.length), 1)[0];
			var exitDirection = JSON.parse(fromExit.properties.exit);
			var templates = this.templates.filter(function(t) {
				if (
					(t.properties.mapping) ||
					(!!t.properties.hallway != isHallway) ||
					(t.properties.start) ||
					(
						(t.properties.end) &&
						(fromRoom.distance + 1 != this.maxDistance)
					)
				)
					return false;
				else {
					var isValid = t.exits.some(function(e) {
						var direction = JSON.parse(e.properties.exit);
						return ((direction[0] == -exitDirection[0]) && (direction[1] == -exitDirection[1]));
					});

					if ((isValid) && (t.properties.maxOccur)) {
						var occurs = this.rooms.filter(r => (r.template.typeId == t.typeId)).length;
						if (occurs >= ~~t.properties.maxOccur)
							isValid = false;
					}

					if ((isValid) && (fromRoom.distance + 1 == this.maxDistance)) {
						//If there is an exit available, rather use that
						if (!t.properties.end) {
							var endsAvailable = this.templates.filter(function(tt) {
								if (!tt.properties.end)
									return false;
								else if (!~~tt.properties.maxOccur)
									return true;
								else if (this.rooms.filter(r => r.template.typeId == tt.typeId).length < ~~tt.properties.maxOccur)
									return true;
							}, this);

							if (endsAvailable.length > 0)
								isValid = false;
						}
					}

					return isValid;
				}
			}, this);

			if (templates.length == 0) {
				fromRoom.template.exits.push(fromExit);
				return false;
			}

			var template = extend(true, {}, templates[this.randInt(0, templates.length)]);

			var templateExit = template.exits.filter(function(e) {
				var direction = JSON.parse(e.properties.exit);
				return ((direction[0] == -exitDirection[0]) && (direction[1] == -exitDirection[1]));
			});
			templateExit = templateExit[this.randInt(0, templateExit.length)];
			var exitIndex = template.exits.firstIndex(e => e == templateExit);

			template.exits.splice(exitIndex, 1);

			var success = this.buildRoom(template, fromRoom, templateExit, fromExit, isHallway);
			if (!success) {
				fromRoom.template.exits.push(fromExit);
				return false;
			}

			return true;
		},

		offsetRooms: function(room) {
			var bounds = this.bounds;
			var dx = (this.bounds[0] < 0) ? -bounds[0] : 0;
			var dy = (this.bounds[1] < 0) ? -bounds[1] : 0;

			this.performOffset(room, dx, dy);

			this.bounds = [bounds[0] + dx, bounds[1] + dy, bounds[2] + dx, bounds[3] + dy];
		},

		performOffset: function(room, dx, dy) {
			room.x += dx;
			room.y += dy;

			room.connections.forEach(c => this.performOffset(c, dx, dy), this);
		},

		updateBounds: function(room) {
			this.bounds[0] = Math.min(this.bounds[0], room.x);
			this.bounds[1] = Math.min(this.bounds[1], room.y);
			this.bounds[2] = Math.max(this.bounds[2], room.x + room.template.width);
			this.bounds[3] = Math.max(this.bounds[3], room.y + room.template.height);
		},

		doesCollide: function(room, ignore) {
			for (var i = 0; i < this.rooms.length; i++) {
				var r = this.rooms[i];
				if (r == ignore)
					continue;

				var collides = (!(
					(room.x + room.template.width < r.x) ||
					(room.y + room.template.height < r.y) ||
					(room.x >= r.x + r.template.width) ||
					(room.y >= r.y + r.template.height)
				));
				if (collides)
					return true;
			}

			return false;
		},

		randInt: function(min, max) {
			return ~~(Math.random() * (max - min)) + min;
		}
	};
});