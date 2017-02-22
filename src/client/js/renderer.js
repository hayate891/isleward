define([
	'js/resources',
	'js/system/events',
	'js/misc/physics',
	'js/rendering/effects',
	'js/rendering/tileOpacity',
	'js/rendering/particles',
	'js/rendering/shaders/outline'
], function(
	resources,
	events,
	physics,
	effects,
	tileOpacity,
	particles,
	shaderOutline
) {
	var pixi = PIXI;

	return {
		stage: null,
		layers: {
			objects: null,
			mobs: null,
			characters: null,
			attacks: null,
			effects: null,
			particles: null,
			tileSprites: null,
			hiders: null
		},

		chunkSize: 30,

		titleScreen: false,

		pad: {
			x: 10,
			y: 10
		},

		width: 0,
		height: 0,

		pos: {
			x: 0,
			y: 0
		},
		moveTo: null,
		moveSpeed: 0,
		moveSpeedMax: 1.50,
		moveSpeedInc: 0.5,
		moveSpeedFlatten: 16,

		zoneId: null,

		textures: {},
		textureCache: {},

		lastTick: null,

		init: function() {
			PIXI.GC_MODES.DEFAULT = PIXI.GC_MODES.AUTO;
			PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

			events.on('onGetMap', this.onGetMap.bind(this));
			events.on('onDeath', this.onDeath.bind(this));
			events.on('onToggleFullscreen', this.toggleScreen.bind(this));

			this.width = $('body').width();
			this.height = $('body').height();

			this.pad.x = ~~((this.width / 2) / 32);
			this.pad.y = ~~((this.height / 2) / 32);

			this.renderer = pixi.autoDetectRenderer(this.width, this.height, {
				backgroundColor: 0x2d2136
			});

			window.onresize = this.onResize.bind(this);

			$(this.renderer.view)
				.appendTo('.canvasContainer');

			this.stage = new pixi.Container();

			var layers = this.layers;
			Object.keys(layers).forEach(function(l) {
				layers[l] = new pixi.Container();

				this.stage.addChild(layers[l])
			}, this);

			resources.spriteNames.forEach(function(t) {
				var spriteName = t;
				var tSplit = t.split('|');
				if (tSplit.length > 1)
					spriteName = tSplit[0];

				var image = resources.sprites[spriteName].image;
				this.textures[spriteName] = new pixi.BaseTexture(image);
				this.textures[spriteName].scaleMode = pixi.SCALE_MODES.NEAREST;
			}, this);

			particles.init({
				renderer: this.renderer,
				stage: this.layers.particles
			});
		},

		toggleScreen: function() {
			var screenMode = 0;

			var isFullscreen = (window.innerHeight == screen.height);
			if (isFullscreen)
				screenMode = 0;
			else
				screenMode = 1;

			if (screenMode == 0) {
				(document.cancelFullscreen || document.msCancelFullscreen || document.mozCancelFullscreen || document.webkitCancelFullScreen).call(document);
				return 'Windowed';
			} else if (screenMode == 1) {
				var el = $('body')[0];
				(el.requestFullscreen || el.msRequestFullscreen || el.mozRequestFullscreen || el.webkitRequestFullscreen).call(el);
				return 'Fullscreen';
			}
		},

		buildTitleScreen: function() {
			this.titleScreen = true;

			this.setPosition({
				x: 0,
				y: 0
			}, true);

			var w = Math.ceil(this.width / scale) + 1;
			var h = Math.ceil(this.height / scale) + 1;

			var container = this.layers.tileSprites;

			for (var i = 0; i < w; i++) {
				for (var j = 0; j < h; j++) {
					var tile = 5;
					if (Math.random() < 0.4)
						tile = 6;
					var tile = new pixi.Sprite(this.getTexture('sprites', tile));

					var alpha = Math.sin((i % 4) + Math.cos(j % 8));
					if (tile == 5)
						alpha /= 2;

					tile.alpha = alpha;
					tile.position.x = i * scale;
					tile.position.y = j * scale;
					tile.width = scale;
					tile.height = scale;

					if (Math.random() < 0.5) {
						tile.position.x += scale;
						tile.scale.x = -scaleMult;
					}

					container.addChild(tile);
				}
			}
		},

		onDeath: function(pos) {
			this.setPosition({
				x: (pos.x - (this.width / (scale * 2))) * scale,
				y: (pos.y - (this.height / (scale * 2))) * scale
			}, true);
		},

		onResize: function() {
			this.width = $('body').width();
			this.height = $('body').height();

			this.renderer.resize(this.width, this.height);
			if (window.player) {
				this.setPosition({
					x: (window.player.x - (this.width / (scale * 2))) * scale,
					y: (window.player.y - (this.height / (scale * 2))) * scale
				}, true);
			}

			if (this.titleScreen) {
				this.clean();
				this.buildTitleScreen();
			}

			events.emit('onResize');
		},

		getTexture: function(baseTex, cell, size) {
			size = size || window.spriteSize;
			var name = baseTex + '_' + cell;

			var textureCache = this.textureCache;

			var cached = textureCache[name];

			if (!cached) {
				var y = ~~(cell / 8);
				var x = cell - (y * 8);
				try {
					cached = new pixi.Texture(this.textures[baseTex], new pixi.Rectangle(x * size, y * size, size, size));
				}
				catch (e) {
					cached = new pixi.Texture(this.textures[baseTex], new pixi.Rectangle(0 * size, 0 * size, size, size));		
				}

				textureCache[name] = cached;
			}

			return cached;
		},

		clean: function() {
			var container = this.layers.tileSprites;
			this.stage.removeChild(container);

			this.layers.tileSprites = container = new pixi.Container(2500);
			container.layer = 'tiles';
			this.stage.addChild(container);

			this.stage.children.sort(function(a, b) {
				if (a.layer == 'tiles')
					return -1;
				else if (b.layer == 'tiles')
					return 1;
				else
					return 0;
			}, this);
		},

		onGetMapCustomization: function(msg) {
			if (!msg.collide) {
				var children = this.layers.tiles.children;
				var cLen = children.length;
				var x = msg.x * scale;
				var y = msg.y * scale;
				for (var i = cLen - 1; i >= 0; i--) {
					var c = children[i];
					var cx = c.x;
					if (c.scale.x < 0)
						cx -= scale;
					if ((cx == x) && (c.y == y)) {
						c.parent.removeChild(c);
						break;
					}
				}
			}

			var tile = new pixi.Sprite(this.getTexture('sprites', msg.tile))

			tile.alpha = tileOpacity.map(msg.tile);
			tile.position.x = msg.x * scale;
			tile.position.y = msg.y * scale;
			tile.width = scale;
			tile.height = scale;

			if (Math.random() < 0.5) {
				tile.position.x += scale;
				tile.scale.x = -scaleMult;
			}

			this.layers.tiles.addChild(tile);

			physics.collisionMap[msg.x][msg.y] = msg.collide;
			physics.graph.grid[msg.x][msg.y] = !msg.collide;
		},

		buildTile: function(c, i, j) {
			var alpha = tileOpacity.map(c);
			var canFlip = tileOpacity.canFlip(c);

			var tile = new pixi.Sprite(this.getTexture('sprites', c + (0 * 160)));

			tile.alpha = alpha;
			tile.position.x = i * window.spriteSize;
			tile.position.y = j * window.spriteSize;
			tile.width = window.spriteSize;
			tile.height = window.spriteSize;

			if (canFlip) {
				if (Math.random() < 0.5) {
					tile.position.x += window.spriteSize;
					tile.scale.x = -1;
				}
			}

			return tile;
		},

		onGetMap: function(msg) {
			this.titleScreen = false;
			physics.init(msg.collisionMap);

			var map = msg.map;
			var w = this.w = map.length;
			var h = this.h = map[0].length;

			var hiddenWalls = msg.hiddenWalls;
			var hiddenTiles = msg.hiddenTiles;

			this.hiddenRooms = msg.hiddenRooms;
			this.hiddenRooms.forEach(function(h) {
				h.container = new pixi.Container();
				this.layers.hiders.addChild(h.container);

				this.buildRectangle({
					x: h.x * scale,
					y: h.y * scale,
					w: h.width * scale,
					h: h.height * scale,
					color: 0x2d2136,
					parent: h.container
				});

				for (var i = h.x; i < h.x + h.width; i++) {
					for (var j = h.y; j < h.y + h.height; j++) {
						var cell = hiddenTiles[i][j];
						if (cell != 0) {
							var tile = this.buildTile(cell - 1, i, j);

							tile.position.x *= scaleMult;
							tile.position.y *= scaleMult;
							tile.width = scale;
							tile.height = scale;

							h.container.addChild(tile);
						}

						cell = hiddenWalls[i][j];
						if (cell == 0)
							continue;

						var tile = this.buildTile(cell - 1, i, j);

						tile.position.x *= scaleMult;
						tile.position.y *= scaleMult;
						tile.width = scale;
						tile.height = scale;

						h.container.addChild(tile);
					}
				}
			}, this);

			this.clean();

			var chunkSize = this.chunkSize;

			var cw = w / chunkSize;
			var ch = h / chunkSize;

			for (var i = 0; i < cw; i++) {
				var tw = Math.min(chunkSize, w - (i * chunkSize));

				for (var j = 0; j < ch; j++) {
					var th = Math.min(chunkSize, h - (j * chunkSize));

					var renderTexture = pixi.RenderTexture.create(tw * window.spriteSize, th * window.spriteSize);
					var container = new pixi.particles.ParticleContainer(2700);

					for (var x = i * chunkSize; x < (i * chunkSize) + tw; x++) {
						for (var y = (j * chunkSize); y < (j * chunkSize) + th; y++) {
							var cell = null;

							cell = map[x][y];
							if (!cell)
								continue;
							if (!cell.split)
								cell += '';
							cell = cell.split(',');
							for (var k = 0; k < cell.length; k++) {
								var c = cell[k];
								if (c == 0)
									continue;

								c--;

								var tile = this.buildTile(c, x - (i * chunkSize), y - (j * chunkSize));
								container.addChild(tile);
							}
						}
					}

					this.renderer.render(container, renderTexture);

					var texture = new pixi.Texture(
						renderTexture, 
						new pixi.Rectangle(
							0, 
							0, 
							tw * window.spriteSize, 
							th * window.spriteSize
						)
					);

					var sprite = new pixi.Sprite(texture);
					sprite.position.x = i * chunkSize * scale;
					sprite.position.y = j * chunkSize * scale;
					sprite.width = tw * scale;
					sprite.height = th * scale;

					this.layers.tileSprites.addChild(sprite);
				}
			}

			this.stage.children.sort(function(a, b) {
				if (a.layer == 'tiles')
					return -1;
				else if (b.layer == 'tiles')
					return 1;
				else
					return 0;
			}, this);

			if (this.zoneId != null)
				events.emit('onRezone', this.zoneId);
			this.zoneId = msg.zoneId;

			msg.clientObjects.forEach(function(c) {
				c.zoneId = this.zoneId;
				events.emit('onGetObject', c);
			}, this);
		},

		setPosition: function(pos, instant) {
			pos.x += 16;
			pos.y += 16;

			this.hideHiders();

			if (instant) {
				this.moveTo = null;
				this.pos = pos;
				this.stage.x = -~~this.pos.x;
				this.stage.y = -~~this.pos.y;
				return;
			}

			this.moveTo = pos;
		},

		hideHiders: function() {
			var player = window.player;
			if (!player)
				return;

			var x = player.x;
			var y = player.y;

			var hiddenRooms = this.hiddenRooms;
			var hLen = hiddenRooms.length;
			for (var i = 0; i < hLen; i++) {
				var h = hiddenRooms[i];
				h.container.visible = (
					(x < h.x) ||
					(x >= h.x + h.width) ||
					(y < h.y) ||
					(y >= h.y + h.height)
				);
			}
		},

		update: function() {
			var time = +new Date;

			if (this.moveTo) {
				var deltaX = this.moveTo.x - this.pos.x;
				var deltaY = this.moveTo.y - this.pos.y;

				if ((deltaX != 0) || (deltaY != 0)) {
					var moveSpeed = this.moveSpeed;
					var distance = Math.max(Math.abs(deltaX), Math.abs(deltaY));

					var moveSpeedMax = this.moveSpeedMax;
					if (distance > 100)
						moveSpeedMax *= 1.75;
					if (this.moveSpeed < moveSpeedMax)
						this.moveSpeed += this.moveSpeedInc;

					var elapsed = time - this.lastTick;
					moveSpeed *= (elapsed / 16.67);

					if (moveSpeed > distance)
						moveSpeed = distance;

					deltaX = (deltaX / distance) * moveSpeed;
					deltaY = (deltaY / distance) * moveSpeed;

					this.pos.x = this.pos.x + (deltaX);
					this.pos.y = this.pos.y + (deltaY);
				} else {
					this.moveSpeed = 0;
					this.moveTo = null;
				}

				this.stage.x = -~~this.pos.x;
				this.stage.y = -~~this.pos.y;

				events.emit('onSceneMove');
			}

			this.lastTick = time;
		},

		buildContainer: function(obj) {
			var container = new pixi.Container;
			this.layers[obj.layerName || obj.sheetName].addChild(container);

			return container;
		},

		buildRectangle: function(obj) {
			var graphics = new pixi.Graphics;

			var alpha = obj.alpha;
			if (alpha != null)
				graphics.alpha = alpha;

			var fillAlpha = obj.fillAlpha;
			if (fillAlpha == null)
				fillAlpha = 1;

			graphics.beginFill(obj.color || '0x48edff', fillAlpha);

			if (obj.strokeColor)
				graphics.lineStyle(scaleMult, obj.strokeColor);

			graphics.moveTo(obj.x, obj.y);
			graphics.lineTo(obj.x + obj.w, obj.y);
			graphics.lineTo(obj.x + obj.w, obj.y + obj.h);
			graphics.lineTo(obj.x, obj.y + obj.h);
			graphics.lineTo(obj.x, obj.y);

			graphics.endFill();

			(obj.parent || this.layers[obj.layerName || obj.sheetName]).addChild(graphics);

			return graphics;
		},

		moveRectangle(obj) {
			var points = obj.sprite.graphicsData[0].shape.points;
			if (!points)
				return;

			obj.sprite.dirty = true;
			obj.sprite.clearDirty = true;

			points[0] = obj.x;
			points[1] = obj.y;
			points[2] = obj.x + obj.w;
			points[3] = obj.y;
			points[4] = obj.x + obj.w;
			points[5] = obj.y + obj.h;
			points[6] = obj.x;
			points[7] = obj.y + obj.h;
			points[8] = obj.x;
			points[9] = obj.y;
		},

		buildObject: function(obj) {
			var w = 8;
			var h = 8;
			if (obj.w) {
				w = obj.w / scaleMult;
				h = obj.h / scaleMult;
			}

			if (obj.sheetName == 'bosses') {
				obj.layerName = 'mobs';
				w = 24;
				h = 24;
				obj.w = w * scaleMult;
				obj.h = h * scaleMult;
			} else if (obj.sheetName == 'bigObjects') {
				obj.layerName = 'mobs';
				w = 24;
				h = 24;
				obj.w = w * scaleMult;
				obj.h = h * scaleMult;
			}

			var sprite = new pixi.Sprite(this.getTexture(obj.sheetName, obj.cell, w))
			sprite.x = obj.x * scale;
			sprite.y = obj.y * scale;
			sprite.width = obj.w || scale;
			sprite.height = obj.h || scale;

			if (obj.sheetName == 'bosses') {
				sprite.x -= scale;
				sprite.y -= (scale * 2);
			} else if (obj.sheetName == 'bigObjects') {
				sprite.x -= scale;
				sprite.y -= (scale * 2);
				sprite.alpha = 0.80;
			}

			if (obj.flipX) {
				sprite.scale.x *= -1;
				if ((obj.sheetName == 'bosses') || (obj.sheetName == 'bigObjects'))
					sprite.x += (scale * 2);
				else
					sprite.x += scale;
			}
			(this.layers[obj.layerName || obj.sheetName] || this.layers.objects).addChild(sprite);

			return sprite;
		},

		addFilter: function(sprite) {
			var thickness = 16;
			if (sprite.width > scale)
				thickness = 8;

			var filter = new shaderOutline(this.renderer.width, this.renderer.height, thickness, '0xffffff');

			if (!sprite.filters)
				sprite.filters = [filter];
			else
				sprite.filters.push();

			return filter;
		},

		removeFilter: function(sprite, filter) {
			if (!sprite.filters)
				return;

			sprite.filters = null;
		},

		buildText: function(obj) {
			var textSprite = new pixi.Text(obj.text, {
				fontFamily: 'bitty',
				fontSize: (obj.fontSize || 14),
				fill: obj.color || 0xF2F5F5,
				stroke: 0x2d2136,
				strokeThickness: 4,
				align: 'center'
			});

			textSprite.x = obj.x - (textSprite.width / 2);
			textSprite.y = obj.y;

			var parent = obj.parent || this.layers[obj.layerName]
			parent.addChild(textSprite);

			return textSprite;
		},

		buildEmitter: function(config) {
			return particles.buildEmitter(config);
		},

		destroyEmitter: function(emitter) {
			particles.destroyEmitter(emitter);
		},

		setSprite: function(obj) {
			var cell = obj.cell;
			var y = ~~(cell / 8);
			var x = cell - (y * 8);

			var baseTex = this.textures[obj.sheetName];
			obj.sprite.texture = this.getTexture(obj.sheetName, obj.cell, obj.sprite.width / scaleMult);
		},

		reorder: function(sprite) {
			var mobLayer = this.layers.mobs;
			var mobs = mobLayer.children;
			mobs.sort(function(a, b) {
				return (b.y - a.y);
			});
		},

		destroyObject: function(obj) {
			if (!obj.sprite.parent)
				return;
			obj.sprite.parent.removeChild(obj.sprite);
		},

		render: function() {
			if (!this.stage)
				return;

			effects.render();
			particles.update();

			this.renderer.render(this.stage);
		}
	};
});