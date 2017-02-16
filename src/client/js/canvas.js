define([
	'js/system/events',
	'js/resources',
	'js/rendering/tileOpacity',
	'js/misc/physics',
	'js/spriteBuilder'
], function(
	events,
	resources,
	tileOpacity,
	physics,
	spriteBuilder
) {
	return {
		map: null,
		mapSprite: null,

		//TEST: Remove
		visMap: null,

		pos: {
			x: 0,
			y: 0
		},
		moveTo: null,
		moveSpeed: 0,
		moveSpeedMax: 1.5,
		moveSpeedInc: 0.5,
		moveSpeedFlatten: 16,

		size: {
			x: 0,
			y: 0,
		},
		layers: {},

		tileSize: {
			w: 32,
			h: 32
		},

		zoneId: null,

		player: null,

		init: function() {
			events.on('onGetMap', this.onGetMap.bind(this));

			var canvas = $('.canvasContainer canvas');

			canvas.each(function(i, c) {
				c = $(c);

				if (!c.attr('layer'))
					return;

				this.layers[c.attr('layer')] = {
					canvas: c,
					ctx: c[0].getContext('2d')
				};

				c[0].width = this.size.x = $('body').width();
				c[0].height = this.size.y = $('body').height();
				c.css('z-index', i + 1);
			}.bind(this));

			this.layers.particles.ctx.globalCompositeOperation = 'lighter';

			$('.canvasContainer')
				.width(this.size.x)
				.height(this.size.y);
		},
		onGetMap: function(msg) {
			$('.canvasContainer')
				.removeClass('visible');

			setTimeout(function() {
				$('.canvasContainer').addClass('visible');
			}, 1000);
			
			if (this.zoneId != null) {
				events.emit('onRezone', this.zoneId);
			}

			this.zoneId = msg.zoneId;

			$('.canvasContainer').addClass('visible');

			this.map = msg.map;
			this.visMap = msg.visMap;

			physics.init(msg.collisionMap);

			msg.clientObjects.forEach(function(c) {
				c.zoneId = this.zoneId;
				events.emit('onGetObject', c);
			}, this);

			this.mapSprite = spriteBuilder.buildSprite(
				['tiles', 'walls', 'objects'], [this.map['tiles'], this.map['walls'], this.map['objects']], [0.55, 0.85, 0.85]
			);
		},
		fadeOut: function() {
			$('.canvasContainer')
				.removeClass('visible');

			setTimeout(function() {
				$('.canvasContainer').addClass('visible');
			}, 1000);
		},
		setPosition: function(pos, instant) {
			if (instant) {
				this.fadeOut();

				this.moveTo = null;
				this.pos = pos;
				return;
			}

			this.moveTo = pos;
		},
		clear: function(filter) {
			for (var l in this.layers) {
				var ctx = this.layers[l].ctx;

				ctx.save();

				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.clearRect(0, 0, this.size.x, this.size.y);

				ctx.restore();
			}
		},
		begin: function() {
			if (this.moveTo) {
				var deltaX = this.moveTo.x - this.pos.x;
				var deltaY = this.moveTo.y - this.pos.y;

				if ((deltaX != 0) || (deltaY != 0)) {
					var moveSpeed = this.moveSpeed;
					var distance = Math.max(Math.abs(deltaX), Math.abs(deltaY));
					if (moveSpeed > distance)
						moveSpeed = distance;

					if (distance > this.moveSpeedFlatten) {
						var maxSpeed = this.moveSpeedMax;
						if (distance > 64) {
							maxSpeed += (distance - 64) / 1000;
						}
						if (this.moveSpeed < maxSpeed)
							this.moveSpeed += this.moveSpeedInc;
					}

					deltaX = (deltaX / distance) * moveSpeed;
					deltaY = (deltaY / distance) * moveSpeed;

					this.pos.x = this.pos.x + (deltaX);
					this.pos.y = this.pos.y + (deltaY);
				} else {
					this.moveSpeed = 0;
					this.moveTo = null;
				}
			}

			for (var l in this.layers) {
				var ctx = this.layers[l].ctx;

				ctx.save();
				ctx.translate(-~~this.pos.x, -~~this.pos.y);
			}
		},
		end: function() {
			for (var l in this.layers) {
				var ctx = this.layers[l].ctx;

				ctx.restore();
			}
		},

		renderMap: function() {
			if (!this.player)
				return;

			this.layers['tiles'].ctx.drawImage(
				this.mapSprite, 
				this.pos.x, 
				this.pos.y, 
				this.size.x, 
				this.size.y, 
				this.pos.x, 
				this.pos.y, 
				this.size.x, 
				this.size.y
			);
		},
		renderObject: function(obj) {
			if (!this.player)
				return;

			var x = obj.x;
			var y = obj.y;

			var pX = this.player.x;
			var pY = this.player.y;

			var dx = Math.abs(x - pX);
			var dy = Math.abs(y - pY);

			var dxMax = (this.size.x / 64) + 4;
			var dyMax = (this.size.y / 64) + 4;

			if ((dx > dxMax) || (dy > dyMax))
				return;

			var sprite = resources.sprites[obj.sheetName].image;
			var ctx = this.layers[obj.layerName || obj.sheetName].ctx;

			var tileY = ~~(obj.cell / 8);
			var tileX = obj.cell - (tileY * 8);

			var offsetX = obj.offsetX || 0;
			var offsetY = obj.offsetY || 0;

			var alpha = 1;
			if (obj.alpha != null)
				alpha = obj.alpha;

			ctx.globalAlpha = alpha;

			var size = obj.size || 32;

			if (obj.flipX) {
				ctx.save();
				ctx.scale(-1, 1);
				ctx.drawImage(
					sprite,
					tileX * 32,
					tileY * 32,
					32,
					32, 
					-(x * 32) - (~~(offsetX / 4) * 4),
					(y * 32) + (~~(offsetY / 4) * 4), 
					-32,
					32
				);
				ctx.restore();
			} 
			else if (obj.flipY) {
				ctx.save();
				ctx.scale(1, -1);
				ctx.drawImage(
					sprite,
					tileX * 32,
					tileY * 32,
					32,
					32, 
					(x * 32) - (~~(offsetX / 4) * 4),
					-(y * 32) + (~~(offsetY / 4) * 4), 
					32,
					-32
				);
				ctx.restore();
			} else
				ctx.drawImage(sprite, tileX * size, tileY * size, size, size, (x * 32) + (~~(offsetX / 4) * 4), (y * 32) + (~~(offsetY / 4) * 4), size, size);
		},
		renderRect: function(layer, x, y, color) {
			if (!this.player)
				return;

			var pX = this.player.x;
			var pY = this.player.y;

			var dx = Math.abs(x - pX);
			var dy = Math.abs(y - pY);

			var dxMax = (this.size.x / 64) + 4;
			var dyMax = (this.size.y / 64) + 4;

			if ((dx > dxMax) || (dy > dyMax))
				return;

			var ctx = this.layers[layer].ctx;
			ctx.fillStyle = color;
			ctx.fillRect(x * 32, y * 32, 32, 32);
		},
		renderText: function(layer, text, x, y) {
			var ctx = this.layers[layer].ctx;
			ctx.fillStyle = 'white';

			ctx.fillText(text, x, y);
		},
		renderOutlineText: function(layer, text, x, y, centerX) {
			var ctx = this.layers[layer].ctx;
			ctx.lineWidth = 2;

			if (centerX)
				x -= (ctx.measureText(text).width / 2);

			ctx.strokeText(text, x, y);
			ctx.fillText(text, x, y);
		}
	};
});