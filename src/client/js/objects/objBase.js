define([
	'js/components/components',
	'js/renderer',
	'js/system/events'
], function(
	components,
	renderer,
	events
) {
	var scale = 40;
	var scaleMult = 5;

	return {
		components: [],
		offsetX: 0,
		offsetY: 0,
		eventCallbacks: {},
		
		addComponent: function(type, options) {
			var c = this[type];
			
			if ((!c) || (options.new)) {
				var template = components.getTemplate(type);
				if (!template)
					return;

				c = $.extend(true, {}, template);
				c.obj = this;

				for (var o in options) {
					c[o] = options[o];
				}

				//Only use component to initialize other components?
				if ((c.init) && (c.init(options)))
					return null;

				this[c.type] = c;
				this.components.push(c);

				return c;
			}
			else {
				if (c.extend)
					c.extend(options);

				return c;
			}
		},

		render: function() {
			return;
			if (this.sheetName)
				canvas.renderObject(this);

			var components = this.components;
			var len = components.length;
			for (var i = 0; i < len; i++) {
				var c = components[i];
				if (c.render)
					c.render();
			}
		},

		update: function() {
			var components = this.components;
			var len = components.length;
			for (var i = 0; i < len; i++) {
				var c = components[i];
				if (c.update)
					c.update();

				if (c.destroyed) {
					if (c.destroy)
						c.destroy();
					
					components.splice(i, 1);
					i--;
					len--;
					delete this[c.type];
				}
			}
		},

		on: function(event, callback) {
			var list = this.eventCallbacks[event] || (this.eventCallbacks[event] = []);
			list.push(events.on(event, callback));
		},

		setSpritePosition: function() {
			if (!this.sprite)
				return;

			this.sprite.x = (this.x * scale) + (this.flipX ? scale : 0) + this.offsetX;
			var oldY = this.sprite.x;
			this.sprite.y = (this.y * scale) + this.offsetY;

			if (this.sprite.width > scale) {
				if (this.flipX)
					this.sprite.x += scale;
				else
					this.sprite.x -= scale;

				this.sprite.y -= (scale * 2);
			}

			if (oldY != this.sprite.y)
				renderer.reorder();

			this.sprite.scale.x = (this.flipX ? -scaleMult : scaleMult);

			['nameSprite', 'chatSprite'].forEach(function(s, i) {
				var sprite = this[s];
				if (!sprite)
					return;

				var yAdd = scale;
				if (i == 1)
					yAdd *= -0.8;

				sprite.x = (this.x * scale) + (scale / 2) - (sprite.width / 2);
				sprite.y = (this.y * scale) + yAdd;
			}, this);

			if (this.stats)
				this.stats.updateHpSprite();
		},

		destroy: function() {
			if (this.sprite)
				renderer.destroyObject(this);
			if (this.nameSprite)
				renderer.destroyObject({
					layerName: 'effects',
					sprite: this.nameSprite
				});

			var components = this.components;
			var cLen = components.length;
			for (var i = 0; i < cLen; i++) {
				var c = components[i];
				if (c.destroy)
					c.destroy();
			}

			this.destroyed = true;

			this.offEvents();
		},

		offEvents: function() {
			if (this.pather)
				this.pather.onDeath();

			for (var e in this.eventCallbacks) {
				this.eventCallbacks[e].forEach(function(c) {
					events.off(e, c);
				}, this);
			}
		}
	};
});