define([
	'js/renderer',
	'js/system/events'
], function(
	renderer,
	events
) {
	return {
		type: 'player',

		oldPos: {
			x: 0,
			y: 0
		},

		init: function() {
			this.obj.addComponent('keyboardMover');
			this.obj.addComponent('mouseMover');
			this.obj.addComponent('serverActions');

			this.obj.addComponent('pather');

			events.emit('onGetPortrait', this.obj.class);
		},

		update: function() {
			var obj = this.obj;
			var oldPos = this.oldPos;

			if ((oldPos.x == obj.x) && (oldPos.y == obj.y))
				return;

			var dx = obj.x - oldPos.x;
			var dy = obj.y - oldPos.y;

			var instant = false;
			if ((dx > 5) || (dy > 5))
				instant = true;
			
			if (dx != 0)
				dx = dx / Math.abs(dx);
			if (dy != 0)
				dy = dy / Math.abs(dy);

			this.oldPos.x = this.obj.x;
			this.oldPos.y = this.obj.y;

			this.canvasFollow({
				x: dx,
				y: dy
			}, instant);
		},

		canvasFollow: function(delta, instant) {
			var obj = this.obj;
			delta = delta || {
				x: 0,
				y: 0
			};

			renderer.setPosition({
				x: (obj.x - (renderer.width / (scale * 2))) * scale,
				y: (obj.y - (renderer.height / (scale * 2))) * scale
			}, instant);
		},
	};
});