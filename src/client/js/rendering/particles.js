define([
	'particles',
	'js/rendering/particleDefaults'
], function(
	pixiParticles,
	particleDefaults
) {
	return {
		renderer: null,
		stage: null,

		emitters: [],

		lastTick: null,

		init: function(options) {
			this.renderer = options.renderer;
			this.stage = options.stage;
			this.lastTick = Date.now();
		},

		buildEmitter: function(config) {
			var options = $.extend(true, {}, particleDefaults, config);

			var emitter = new PIXI.particles.Emitter(this.stage, ['images/particles.png'], options);
			emitter.emit = true;

			this.emitters.push(emitter);

			return emitter;
		},

		destroyEmitter: function(emitter) {
			emitter.emit = false;
		},

		update: function() {
			var now = Date.now();

			var emitters = this.emitters;
			var eLen = emitters.length;
			for (var i = 0; i < eLen; i++) {
				var e = emitters[i];
				var destroy = ((!e.emit) && (e.particleCount == 0));

				if (destroy) {
					emitters.splice(i, 1);
					e.destroy();
					e = null;

					i--;
					eLen--;
					continue;
				} 

				e.update((now - this.lastTick) * 0.001);
			}

			this.lastTick = now;
		}
	};
});