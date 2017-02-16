define([
	
], function(
	
) {
	return {
		alpha: {
			start: 0.5,
			end: 0
		},
		scale: {
			start: 10,
			end: 0.3
		},
		color: {
			start: 'fb1010',
			end: 'f5b830'
		},
		speed: {
			start: 10,
			end: 5
		},
		startRotation: {
			min: 0,
			max: 360
		},
		rotationSpeed: {
			min: 0,
			max: 0
		},
		lifetime: {
			min: 2,
			max: 5
		},
		frequency: 0.1,
		emitterLifetime: -1,
		pos: {
			x: 0,
			y: 0
		},
		addAtBack: false,

		spawnType: 'circle',
		spawnCircle: {
			x: 0,
			y: 0,
			r: 0.1
		},
		blendMode: 'add',

		allowRotation: false
	};
});