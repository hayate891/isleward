define([
	'js/objects/objBase',
	'js/system/events',
	'js/renderer'
], function(
	objBase,
	events,
	renderer
) {
	var scale = 40;

	return {
		showNames: false,

		objects: [],
		dirty: false,

		init: function() {
			events.on('onKeyDown', this.onKeyDown.bind(this));
			events.on('onGetObject', this.onGetObject.bind(this));
			events.on('onRezone', this.onRezone.bind(this));
			events.on('onChangeHoverTile', this.getLocation.bind(this));
		},

		getLocation: function(x, y) {
			var objects = this.objects;
			var oLen = objects.length;

			var closest = 999;
			var mob = null;
			for (var i = 0; i < oLen; i++) {
				var o = objects[i];
				if ((!o.stats) || (o.nonSelectable))
					continue;

				var dx = Math.abs(o.x - x);
				if ((dx < 3) && (dx < closest)) {
					var dy = Math.abs(o.y - y);
					if ((dy < 3) && (dy < closest)) {
						mob = o;
						closest = Math.max(dx, dy);
					}
				}
			}

			events.emit('onMobHover', mob);
		},

		getClosest: function(x, y, maxDistance, reverse, fromMob, callback) {
			var objects = this.objects;
			var oLen = objects.length;

			var list = objects.filter(function(o) {
				if ((!o.stats) || (o.nonSelectable) || (o == window.player))
					return false;

				var dx = Math.abs(o.x - x);
				if (dx < maxDistance) {
					var dy = Math.abs(o.y - y);
					if (dy < maxDistance)
						return true;
				}
			});

			if (list.length == 0)
				return null;

			list.sort(function(a, b) {
				var aDistance = Math.max(Math.abs(x - a.x), Math.abs(y - a.y));
				var bDistance = Math.max(Math.abs(x - b.x), Math.abs(y - b.y));

				return (aDistance - bDistance);
			});

			if (!fromMob)
				return list[0];

			var fromIndex = list.firstIndex(function(l) {
				return (l.id == fromMob.id);
			});

			if (reverse) {
				fromIndex = (fromIndex === 0 ? list.length : fromIndex) - 1;
			} else {
				fromIndex = (fromIndex + 1) % list.length;
			}
			console.log(fromIndex);
			return list[fromIndex];
		},

		onRezone: function(oldZone) {
			var objects = this.objects;
			var oLen = objects.length
			for (var i = 0; i < oLen; i++) {
				var o = objects[i];

				if (oldZone == null)
					o.destroy();
				else if ((o.zoneId == oldZone) && (o.player == null))
					o.destroy();
			}

			window.player.offEvents();
		},

		onGetObject: function(obj) {
			this.dirty = true;

			//Things like attacks don't have ids
			var exists = null;
			if (obj.id != null) {
				exists = this.objects.find(function(o) {
					return ((o.id == obj.id) && (!o.destroyed));
				});
			}

			if (!exists)
				exists = this.buildObject(obj);
			else {
				this.updateObject(exists, obj);
			}
		},
		buildObject: function(template) {
			var obj = $.extend(true, {}, objBase);

			var components = template.components || [];
			delete template.components;

			for (var p in template) {
				var value = template[p];
				var type = typeof(value);

				if (type == 'object') {

				} else
					obj[p] = value;
			}

			if (obj.sheetName) {
				obj.sprite = renderer.buildObject(obj);
				if (template.hidden)
					obj.sprite.visible = false;
			}

			components.forEach(function(c) {
				//Map ids to objects
				var keys = Object.keys(c).filter(function(k) {
					return ((k.indexOf('id') == 0) && (k.length > 2));
				});
				keys.forEach(function(k) {
					var value = c[k];
					var newKey = k.substr(2, k.length).toLowerCase();

					c[newKey] = this.objects.find(function(o) {
						return (o.id == value);
					});
					delete c[k];
				}, this);

				obj.addComponent(c.type, c);
			}, this);

			this.objects.push(obj);

			if (obj.self) {
				events.emit('onGetPlayer', obj);
				window.player = obj;

				renderer.setPosition({
					x: (obj.x - (renderer.width / (scale * 2))) * scale,
					y: (obj.y - (renderer.height / (scale * 2))) * scale
				}, true);
			}

			if ((obj.name) && (obj.sprite)) {
				obj.nameSprite = renderer.buildText({
					layerName: 'effects',
					text: obj.name,
					x: (obj.x * scale) + (scale / 2),
					y: (obj.y * scale) + scale
				});
				obj.nameSprite.visible = this.showNames;
			}

			return obj;
		},
		updateObject: function(obj, template) {
			var components = template.components || [];

			components.forEach(function(c) {
				//Map ids to objects
				var keys = Object.keys(c).filter(function(k) {
					return ((k.indexOf('id') == 0) && (k.length > 2));
				});
				keys.forEach(function(k) {
					var value = c[k];
					var newKey = k.substr(2, k.length).toLowerCase();

					c[newKey] = this.objects.find(function(o) {
						return (o.id == value);
					});
					delete c[k];
				}, this);

				obj.addComponent(c.type, c);
			}, this);

			delete template.components;

			var oldX = obj.x;

			var sprite = obj.sprite;
			var moved = false;
			for (var p in template) {
				var value = template[p];
				var type = typeof(value);

				if (type != 'object')
					obj[p] = value;

				if ((p == 'x') || (p == 'y'))
					moved = true;

				if (sprite) {
					if (p == 'x') {
						if (obj.x < oldX)
							obj.flipX = true;
						else if (obj.x > oldX)
							obj.flipX = false;
					}
				}
			}

			if (moved)
				obj.setSpritePosition();

			if (((template.sheetName) || (template.cell)) && (sprite))
				renderer.setSprite(obj);
			if (sprite) {
				if (template.hidden != null) {
					sprite.visible = !template.hidden;
				}
			}


			if ((template.x != 0) || (template.y != 0)) {
				if (obj.stats)
					obj.stats.updateHpSprite();
			}

			if ((!obj.sprite) && (template.sheetName))
				obj.sprite = renderer.buildObject(obj);

			if ((!obj.nameSprite) && (template.name)) {
				obj.nameSprite = renderer.buildText({
					layerName: 'effects',
					text: template.name,
					x: (obj.x * scale) + (scale / 2),
					y: (obj.y * scale) + scale
				});
				obj.nameSprite.visible = this.showNames;
			}

			obj.setSpritePosition();
		},
		update: function() {
			var objects = this.objects;
			var len = objects.length;

			for (var i = 0; i < len; i++) {
				var o = objects[i];

				if (o.destroyed) {
					o.destroy();
					objects.splice(i, 1);
					i--;
					len--;
					continue;
				}

				o.update();
				if (o.dirty)
					this.dirty = true;
			}
		},
		render: function() {
			canvas.renderMap();

			var objects = this.objects;
			var len = objects.length;

			var showNames = this.showNames;
			var ctx = canvas.layers.effects.ctx;

			if (showNames) {
				ctx.font = '14px bitty';
				ctx.strokeStyle = 'rgb(0, 0, 0)';
			}

			for (var i = 0; i < len; i++) {
				var o = objects[i];
				o.render();

				if (o.stats) {
					var yOffset = 12;
					if (o.isChampion)
						yOffset = 18;

					ctx.globalAlpha = 1;
					var statValues = o.stats.values;
					var hp = statValues.hp;
					var hpMax = statValues.hpMax;
					if (hp < hpMax) {
						ctx.fillStyle = 'rgb(0, 0, 0)';
						ctx.fillRect(o.x * scale, (o.y * scale) - yOffset, scale, 4);
						var w = (hp / hpMax) * scale;
						ctx.fillStyle = '#cf0056';
						ctx.fillRect(o.x * scale, (o.y * scale) - yOffset, w, 4);
					}
				}

				if ((!showNames) || (!o.name))
					continue;

				//OPTIMIZE: Don't wanna set this every time
				ctx.globalAlpha = 1;
				ctx.fillStyle = 'rgb(255, 255, 255)';
				canvas.renderOutlineText('effects', o.name, (o.x * scale) + (scale / 2), ((o.y + 1) * scale) + (scale / 4), true);
			}
		},

		onKeyDown: function(key) {
			if (key == 'v') {
				this.showNames = !this.showNames;

				var showNames = this.showNames;

				var objects = this.objects;
				var oLen = objects.length;
				for (var i = 0; i < oLen; i++) {
					var ns = objects[i].nameSprite;
					if (!ns)
						continue;

					ns.visible = showNames;
				}
			}
		}
	};
});
