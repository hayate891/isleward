define([
	'js/rendering/renderer',
	'js/system/events'
], function(
	renderer,
	events
) {
	return {
		type: 'walkTrail',

		particleConfig: {
			scale: {
				start: {
					min: 6,
					max: 16
				},
				end: {
					min: 0,
					max: 4
				}
			},
			speed: {
				start: {
					min: 4,
					max: 24
				},
				end: {
					min: 0,
					max: 2
				}
			},
			lifetime: {
				min: 1,
				max: 2
			},
			alpha: {
				start: 0.75,
				end: 0
			},
			color: {
				start: ['d43346', 'a24eff', '80f643', 'ffeb38', 'ff6942', 'fc66f7'],
				end: ['2d2136']
			},
			spawnType: 'circle',
			spawnCircle: {
				x: 0,
				y: 0,
				r: 20
			},
			randomScale: true,
			randomColor: true,
			randomSpeed: true,
			chance: 0.22
		},

		leaveTrail: function(pos) {
			events.emit('onGetObject', {
				x: pos.x,
				y: pos.y,
				components: [{
					type: 'particles',
					blueprint: this.particleConfig,
					ttl: 30
				}]
			});
		}
	};
});