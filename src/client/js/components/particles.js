define([
	'js/renderer'
], function(
	renderer
) {
	return {
		type: 'particles',
		emitter: null,

		init: function(blueprint) {
			this.blueprint = this.blueprint || {};
			this.blueprint.pos = {
				x: (this.obj.x * scale) + (scale / 2),
				y: (this.obj.y * scale) + (scale / 2)
			};

			this.emitter = renderer.buildEmitter(this.blueprint);
		},

		update: function() {
			if (this.ttl != null) {
				this.ttl--;
				if (this.ttl <= 0) {
					if (this.destroyObject)
						this.obj.destroyed = true;
					else
						this.destroyed = true;
					return;
				}
			}

			if (!this.emitter.emit)
				return;

			this.emitter.spawnPos.x = (this.obj.x * scale) + (scale / 2);
			this.emitter.spawnPos.y = (this.obj.y * scale) + (scale / 2);
		},

		destroy: function() {
			renderer.destroyEmitter(this.emitter);
		}
	};
});