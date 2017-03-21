define([
	'js/rendering/effects',
	'js/rendering/renderer'
], function(
	effects,
	renderer
) {
	var scale = 40;
	
	return {
		type: 'attackAnimation',

		frames: 4,
		frameDelay: 4,
		layer: 'attacks',
		spriteSheet: 'attacks',

		row: null,
		col: null,

		loop: 1,
		loopCounter: 0,

		frame: 0,

		frameDelayCd: 0,

		flipped: false,

		sprite: null,

		init: function(blueprint) {
			effects.register(this);

			this.flipped = (Math.random() < 0.5);

			this.frameDelayCd = this.frameDelay;

			var cell = (this.row * 8) + this.col + this.frame;

			this.sprite = renderer.buildObject({
				sheetName: this.spriteSheet,
				cell: cell,
				x: this.obj.x,
				y: this.obj.y,
				offsetX: this.obj.offsetX,
				offsetY: this.obj.offsetY,
				flipX: this.flipped
			});
		},

		renderManual: function() {
			if (this.frameDelayCd > 0)
				this.frameDelayCd--;
			else {
				this.frameDelayCd = this.frameDelay;
				this.frame++;
				if (this.frame == this.frames) {
					this.loopCounter++;
					if (this.loopCounter == this.loop) {
						if (this.destroyObject)
							this.obj.destroyed = true;
						else
							this.destroyed = true;
						return;
					}
					else
						this.frame = 0;
				}
			}

			this.sprite.x = this.obj.x * scale;
			this.sprite.y = this.obj.y * scale;

			var cell = (this.row * 8) + this.col + this.frame;

			renderer.setSprite({
				sheetName: this.spriteSheet,
				cell: cell,
				flipX: this.flipped,
				sprite: this.sprite
			});

			if (this.flipped)
				this.sprite.x += scale;
		},

		destroyManual: function() {
			renderer.destroyObject({
				layerName: this.spriteSheet,
				sprite: this.sprite
			});

			effects.unregister(this);
		}	
	};
});