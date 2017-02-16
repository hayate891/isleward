define([
	'js/renderer'
], function(
	renderer
) {
	return {
		type: 'animation',

		frames: 4,
		frameDelay: 4,

		sheet: 'attacks',

		row: null,
		col: null,

		loop: 1,
		loopCounter: 0,

		frame: 0,

		frameDelayCd: 0,

		oldTexture: null,

		init: function(blueprint) {
			if (!this.obj.sprite)
				return true;
			
			this.oldTexture = this.obj.sprite.texture;

			this.frame = 0;
			this.frameDelayCd = 0;

			for (var p in this.template) {
				this[p] = this.template[p];
			}

			this.frameDelayCd = this.frameDelay;

			this.setSprite();		
		},

		setSprite: function() {
			renderer.setSprite({
				sprite: this.obj.sprite,
				cell: (this.row * 8) + this.col + this.frame,
				sheetName: this.sheet
			});
		},

		update: function() {
			if (this.frameDelayCd > 0)
				this.frameDelayCd--;
			else {
				this.frameDelayCd = this.frameDelay;
				this.frame++;
				if (this.frame == this.frames) {
					this.loopCounter++;
					if (this.loopCounter == this.loop) {
						this.destroyed = true;
						return;
					}
					else
						this.frame = 0;
				}
			}

			this.setSprite();
		},

		destroy: function() {
			this.obj.sprite.texture = this.oldTexture;
		}
	};
});