define([
	'js/system/events',
	'js/rendering/renderer',
	'js/system/client',
	'js/input',
	'js/objects/objects'
], function(
	events,
	renderer,
	client,
	input,
	objects
) {
	var scale = 40;

	return {
		type: 'mouseMover',

		hoverTile: {
			x: 0,
			y: 0
		},

		path: [],

		pathColor: 'rgba(255, 255, 255, 0.5)',

		mouseDown: false,
		opacityCounter: 0,

		sprite: null,

		init: function() {
			this.sprite = renderer.buildObject({
				layerName: 'effects',
				x: 0,
				y: 0,
				w: scale,
				h: scale,
				sheetName: 'ui', 
				cell: 7
			});
		},

		clearPath: function() {
			this.path.forEach(function(p) {
				if (p.sprite) {
					renderer.destroyObject({
						sprite: p.sprite,
						layerName: 'effects'
					})
				}
			});

			this.path = [];
		},

		showPath: function(e) {
			if ((e.button != null) && (e.button != 0))
				return;

			var tileX = ~~(e.x / scale);
			var tileY = ~~(e.y / scale);

			if ((tileX == this.hoverTile.x) && (tileY == this.hoverTile.y))
				return;

			events.emit('onChangeHoverTile', tileX, tileY);

			this.hoverTile.x = ~~(e.x / scale);
			this.hoverTile.y = ~~(e.y / scale);

			this.sprite.x = (this.hoverTile.x * scale);
			this.sprite.y = (this.hoverTile.y * scale);

			return;

			if ((!e.down) && (!this.mouseDown))
				return;

			this.mouseDown = true;

			var obj = this.obj;

			this.clearPath();

			//We floor the position in case we're charging (subpixel position)
			var path = physics.getPath({
				x: ~~this.obj.pather.pathPos.x,
				y: ~~this.obj.pather.pathPos.y
			}, {
				x: this.hoverTile.x,
				y: this.hoverTile.y
			});

			this.path = path.map(function(p) {
				return {
					x: p.x,
					y: p.y,
					sprite: renderer.buildRectangle({
						layerName: 'effects',
						x: (p.x * scale) + 4,
						y: (p.y * scale) + 4,
						w: 24,
						h: 24,
						color: '0x48edff',
						alpha: 0.2
					})
				};
			});
		},
		queuePath: function(e) {
			this.mouseDown = false;

			if ((this.path.length == 0) || (e.down))
				return;

			client.request({
				cpn: 'player',
				method: 'moveList',
				data: this.path.map(function(p) {
					return {
						x: p.x,
						y: p.y
					}
				})
			});

			this.obj.pather.setPath(this.path);
			this.path = [];
		},

		update: function() {
			this.opacityCounter++;
			if (this.sprite)
				this.sprite.alpha = 0.35 + Math.abs(Math.sin(this.opacityCounter / 20) * 0.35);
			this.showPath(input.mouse);
		},

		destroy: function() {
			renderer.destroyObject({
				sprite: this.sprite,
				layerName: 'effects'
			});
		}
	};
});