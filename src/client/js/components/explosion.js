define([
	'js/rendering/effects'
], function(
	effects
) {
	return {
		type: 'explosion',

		count: 10,

		blueprint: null,
		particles: null,

		init: function(blueprint) {
			this.blueprint = {
				new: true,
				blueprint: $.extend(true, {
					color: {
						start: ['fcfcfc', '929398'],
						end: ['505360', '3c3f4c']
					},
					scale: {
						start: {
							min: 8,
							max: 18
						},
						end: {
							min: 4,
							max: 12
						}
					},
					speed: {
						start: {
							min: 4,
							max: 24
						},
						end: {
							min: 2,
							max: 18
						}
					},
					
					particlesPerWave: 14,
					particleSpacing: 0,	
					lifetime: {
						min: 1,
						max: 3
					},
					randomColor: true, 
					randomScale: true,
					randomSpeed: true,
					frequency: 1
				}, blueprint.blueprint, {
					spawnType: 'burst',
					emitterLifetime: -1,
					chance: null,
					scale: {
						start: {
							min: 6,
							max: 16
						},
						end: {
							min: 0,
							max: 10
						}
					}
				})
			};	
		},

		explode: function(blueprint) {
			this.particles = this.obj.addComponent('particles', this.blueprint);

			this.particles.emitter.update(0.2);
			this.particles.emitter.emit = false;
		}
	};
});