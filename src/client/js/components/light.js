define([
	'js/canvas',
	'js/rendering/effects',
	'js/renderer'
], function(
	canvas,
	effects,
	renderer
) {
	var scale = 40;

	return {
		type: 'light',

		lightCd: 0,
		lightO: {},

		emitters: {},

		range: 3,

		init: function(blueprint) {
			this.blueprint = this.blueprint || {};

			var x = this.obj.x;
			var y = this.obj.y;

			var range = this.range;
			var halfRange = (range - 1) / 2;

			for (var i = 0; i < range; i++) {
				for (var j = 0; j < range; j++) {
					var n = i + '|' + j;

					var maxAlpha = (1 + ((halfRange * 2) - (Math.abs(halfRange - i) + Math.abs(halfRange - j)))) * 0.1;

					this.emitters[n] = renderer.buildEmitter({
						pos: {
							x: ((x + i - halfRange) * scale) + (scale / 2),
							y: ((y + j - halfRange) * scale) + (scale / 2)
						},
						scale: {
							start: {
								min: 24,
								max: 32
							},
							end: {
								min: 12,
								max: 22
							}
						},
						color: this.blueprint.color || {
							start: ['ffeb38'],
							end: ['ffeb38', 'ff6942', 'd43346']
						},
						alpha: {
							start: maxAlpha,
							end: 0
						},
						frequency: 0.9 + (~~(Math.random() * 10) / 10),
						blendMode: 'screen',
						lifetime: this.blueprint.lifetime || {
							min: 1,
							max: 4
						},
						speed: {
							start: {
								min: 0,
								max: 4
							},
							end: {
								min: 0,
								max: 2
							}
						},
						randomSpeed: true,
						randomColor: true,
						randomScale: true
					});
				}
			}
		},

		update: function() {

		},

		render: function() {
			return;
			if (this.lightCd > 0) {
				this.lightCd--;
			} else {
				this.lightCd = 5;
			}

			ctx = canvas.layers.particles.ctx;
			var color = 'rgba(255, 255, 125, $O$)';

			var x = this.obj.x;
			var y = this.obj.y;

			var range = this.range;
			var halfRange = (range - 1) / 2;

			for (var i = 0; i < range; i++) {
				for (var j = 0; j < range; j++) {
					var o = range - (Math.abs(halfRange - i) + Math.abs(halfRange - j));
					o /= 6;

					var n = i + '|' + j;

					if (this.lightCd == 0) {
						if (Math.random() < 0.5)
							this.lightO[n] = (Math.random() * (o * o));
					}

					o = o * (0.4 + this.lightO[n]);
					canvas.renderRect('effects', (x + i - halfRange), (y + j - halfRange), color.replace('$O$', o));
				}
			}
		},

		destroy: function() {
			var keys = Object.keys(this.emitters);
			for (var i = 0; i < keys.length; i++) {
				var emitter = this.emitters[keys[i]];
				delete this.emitters[keys[i]];

				renderer.destroyEmitter(emitter);
			}
		}
	};
});