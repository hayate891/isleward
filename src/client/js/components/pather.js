define([
	'js/renderer',
	'js/system/events'
], function(
	renderer,
	events
) {
	return {
		type: 'pather',

		path: [],

		pathColor: 'rgba(255, 255, 255, 0.5)',

		pathPos: {
			x: 0,
			y: 0
		},

		lastX: 0,
		lastY: 0,

		init: function() {
			events.on('onDeath', this.onDeath.bind(this));
			events.on('onClearQueue', this.onDeath.bind(this));

			this.pathPos.x = this.obj.x;
			this.pathPos.y = this.obj.y;
		},

		onDeath: function() {
			this.path.forEach(function(p) {
				renderer.destroyObject({
					layerName: 'effects',
					sprite: p.sprite
				});
			});		

			this.path = [];
			this.pathPos.x = this.obj.x;
			this.pathPos.y = this.obj.y;
		},

		add: function(x, y) {
			this.path.push({
				x: x,
				y: y,
				sprite: renderer.buildRectangle({
					layerName: 'effects',
					alpha: 0.2,
					x: (x * scale) + scaleMult,
					y: (y * scale) + scaleMult,
					w: scale - (scaleMult * 2),
					h: scale - (scaleMult * 2)
				})
			});
		},

		update: function() {
			var x = this.obj.x;
			var y = this.obj.y;

			if (this.path.length == 0) {
				this.pathPos.x = x;
				this.pathPos.y = y;
			}

			if ((x == this.lastX) && (y == this.lastY))
				return;

			this.lastX = x;
			this.lastY = y;

			for (var i = 0; i < this.path.length; i++) {
				var p = this.path[i];

				if ((p.x == x) && (p.y == y)) {
					for (var j = 0; j <= i; j++) {
						renderer.destroyObject({
							layerName: 'effects',
							sprite: this.path[j].sprite
						});
					}
					this.path.splice(0, i + 1);
					return;
				}
			}
		},

		setPath: function(path) {
			this.path = this.path.concat(path);

			this.pathPos.x = path[path.length - 1].x;
			this.pathPos.y = path[path.length - 1].y;
		}
	};
});