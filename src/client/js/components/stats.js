define([
	'js/system/events',
	'js/renderer'
], function(
	events,
	renderer
) {
	return {
		type: 'stats',

		values: null,

		init: function(blueprint) {
			if (this.obj.self)
				events.emit('onGetStats', this.values);

			var serverId = this.obj.serverId;
			if (serverId != null)
				events.emit('onGetPartyStats', serverId, this.values);

			var obj = this.obj;

			var yOffset = -12;
			if (obj.isChampion)
				yOffset = -18;

			this.hpSprite = renderer.buildRectangle({
				layerName: 'effects',
				x: 0,
				y: 0,
				w: 0,
				h: 0,
				color: 0x802343
			});

			renderer.buildRectangle({
				x: 0,
				y: 0,
				w: 0,
				h: 0,
				parent: this.hpSprite,
				color: 0xd43346
			});

			this.updateHpSprite();
		},

		updateHpSprite: function() {
			var obj = this.obj;

			var yOffset = -12;
			if (obj.isChampion)
				yOffset = -18;

			var x = obj.x * scale;
			var y = (obj.y * scale) + yOffset;

			renderer.moveRectangle({
				sprite: this.hpSprite,
				x: x + 4,
				y: y,
				w: (scale - 8),
				h: 5
			});

			renderer.moveRectangle({
				sprite: this.hpSprite.children[0],
				x: x + 4,
				y: y,
				w: (this.values.hp / this.values.hpMax) * (scale - 8),
				h: 5
			});

			this.hpSprite.visible = (this.values.hp < this.values.hpMax);
		},

		extend: function(blueprint) {
			var bValues = blueprint.values || {};

			var values = this.values;

			for (var b in bValues) {
				values[b] = bValues[b];
			}

			if (this.obj.self)
				events.emit('onGetStats', this.values);

			var serverId = this.obj.serverId;
			if (serverId != null)
				events.emit('onGetPartyStats', serverId, this.values);

			this.updateHpSprite();
		},

		destroy: function() {
			renderer.destroyObject({
				sprite: this.hpSprite,
				layerName: 'effects'
			});
		}
	};
});