define([
	'pixi',
	'js/rendering/shaders/outline/vert',
	'js/rendering/shaders/outline/frag'
], function(
	pixi,
	vert,
	frag
) {
	var OutlineFilter = function(viewWidth, viewHeight, thickness, color) {
		thickness = thickness || 1;
		pixi.Filter.call(this,
			vert,
			frag.replace(/%THICKNESS%/gi, (1.0 / thickness).toFixed(7))
		);

		this.uniforms.pixelWidth = 0.002;//1.0 / (viewWidth || 1);
		this.uniforms.pixelHeight = 1.0 / (viewHeight || 1);
		this.uniforms.thickness = thickness;
		this.uniforms.outlineColor = new Float32Array([0, 0, 0, 1]);
		this.alpha = 0;
		if (color) {
			this.color = color;
		}
	};

	OutlineFilter.prototype = Object.create(pixi.Filter.prototype);
	OutlineFilter.prototype.constructor = OutlineFilter;

	Object.defineProperties(OutlineFilter.prototype, {
		color: {
			get: function() {
				return pixi.utils.rgb2hex(this.uniforms.outlineColor);
			},
			set: function(value) {
				pixi.utils.hex2rgb(value, this.uniforms.outlineColor);
			}
		},

		alpha: {
			set: function(value) {
				this.uniforms.alpha = value;
			}
		},

		viewWidth: {
			get: function() {
				return 1 / this.uniforms.pixelWidth;
			},
			set: function(value) {
				this.uniforms.pixelWidth = 1 / value;
			}
		},

		viewHeight: {
			get: function() {
				return 1 / this.uniforms.pixelHeight;
			},
			set: function(value) {
				this.uniforms.pixelHeight = 1 / value;
			}
		}
	});

	return OutlineFilter;
});