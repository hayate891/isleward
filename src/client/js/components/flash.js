define([
	'js/renderer'
], function(
	renderer
) {
	return {
		type: 'flash',

		color: '#48edff',

		filter: null,

		lum: -1,
		lumDir: 0.075,

		state: 0,
		maxState: 0,

		frame: 1,

		oldTexture: null,

		init: function() {
			//Destroy self
			if (!this.obj.sprite)
				return true;

			console.log(this.animation);

			this.oldTexture = this.obj.sprite.texture;

			renderer.setSprite({
				sprite: this.obj.sprite,
				cell: 8 + this.frame,
				sheetName: 'animChar'
			});

			this.maxState = ((Math.abs(this.lum) / this.lumDir) + (Math.abs(this.lum) / (this.lumDir))) / 5;
		},

		getColor: function() {
			var hex = String(this.color).replace(/[^0-9a-f]/gi, '');
			if (hex.length < 6)
				hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];

			var rgb = '#';
			var c = 0;
			for (var i = 0; i < 3; i++) {
				c = parseInt(hex.substr(i * 2, 2), 16);
				c = Math.round(Math.min(Math.max(0, c + (c * this.lum)), 255)).toString(16);
				rgb += ('00' + c).substr(c.length);
			}

			return rgb.replace('#', '0x');
		},

		update: function() {
			this.state++;
			if (this.state >= this.maxState) {
				this.state = 0;
				this.frame++;

				if (this.frame <= 5) {
					renderer.setSprite({
						sprite: this.obj.sprite,
						cell: 8 + this.frame,
						sheetName: 'animChar'
					});
				}
			}

			this.lum += this.lumDir;

			if ((this.lumDir > 0) && (this.lum >= 0))
				this.lumDir = -Math.abs(this.lumDir);
			else if ((this.lumDir <= 0) && (this.lum <= -1))
				this.destroyed = true;
		},

		destroy: function() {
			this.obj.sprite.texture = this.oldTexture;
		}
	};
});