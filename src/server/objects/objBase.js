define([
	'../components/components'
], function(
	components
) {
	return {
		components: [],

		actionQueue: [],

		addComponent: function(type, blueprint, isTransfer) {
			var cpn = this[type];
			if (!cpn) {
				var template = components.components[type];
				if (!template) {
					template = extend(true, {
						type: type
					}, blueprint || {});
				}

				var cpn = extend(true, {}, template);
				cpn.obj = this;

				this.components.push(cpn);
				this[cpn.type] = cpn;
			}

			if ((cpn.init) && (this.instance != null))
				cpn.init(blueprint || {}, isTransfer);
			else {
				for (var p in blueprint) {
					cpn[p] = blueprint[p];
				}
			}

			return cpn;
		},

		extendComponent: function(ext, type, blueprint) {
			var template = require('./components/extensions/' + type);
			var cpn = this[ext];

			extend(true, cpn, template);

			if (template.init)
				cpn.init(blueprint);

			return cpn;
		},

		update: function() {
			var usedTurn = false;

			var components = this.components;
			var len = components.length;
			for (var i = 0; i < len; i++) {
				var c = components[i];
				if (c.update) {
					if (c.update())
						usedTurn = true;
				}
			}

			if (!usedTurn) {
				this.performQueue();
			}
		},
		getSimple: function(self, isSave) {
			var s = this.simplify(null, self, isSave);
			if (this.instance)
				s.zoneId = this.instance.zoneId;

			if ((self) && (!isSave)) {
				var syncer = this.syncer;
				if (this.syncer) {
					//Add things that have been queued by the syncer (that aren't tied to server-side components)
					var components = this.syncer.oSelf.components
						.filter((c => !this[c.type]), this)
						.forEach(c => s.components.push(c));
				}
			}

			return s;
		},
		simplify: function(o, self, isSave) {
			var result = {};
			if (!o) {
				result.components = [];
				o = this;
			}

			for (var p in o) {
				var value = o[p];
				if (value == null)
					continue;

				var type = typeof(value);

				//build component
				if (type == 'object') {
					if (value.type) {
						if (!value.simplify) {
							if (self) {
								result.components.push({
									type: value.type
								});
							}
						} else {
							var component = null;

							if (isSave)
								component = value.save ? value.save() : value.simplify(self);
							else
								component = value.simplify(self);

							if (component)
								result.components.push(component);
						}
					}
				} else if (type == 'function') {

				} else
					result[p] = value;
			}

			return result;
		},
		sendEvent: function(event, data) {
			process.send({
				method: 'event',
				id: this.serverId,
				data: {
					event: event,
					data: data
				}
			});
		},

		queue: function(action) {
			if (action.list) {
				var type = action.action;
				var data = action.data;
				var dLen = data.length;
				for (var i = 0; i < dLen; i++) {
					var d = data[i];

					this.actionQueue.push({
						action: type,
						data: d
					});
				}

				return;
			}

			if (action.priority)
				this.actionQueue.splice(this.actionQueue.firstIndex(a => !a.priority), 0, action);
			else
				this.actionQueue.push(action);
		},
		dequeue: function() {
			if (this.actionQueue.length == 0)
				return null;

			return this.actionQueue.splice(0, 1)[0];
		},
		clearQueue: function() {
			if (this.serverId != null) {
				this.instance.syncer.queue('onClearQueue', {
					id: this.id
				}, [this.serverId]);
			}

			this.actionQueue = [];
		},

		performAction: function(action) {
			if (action.instanceModule) {
				/*action.data.obj = this;
				this.instance[action.instanceModule][action.method](action.data);
				this.inventory.resolveCallback(action.data, action.data.result);*/
				return;
			}

			var cpn = this[action.cpn];
			if (!cpn)
				return;

			cpn[action.method](action.data);
		},

		performQueue: function() {
			var q = this.dequeue();
			if (!q) {
				return;
			}

			if (q.action == 'move') {
				if ((this.actionQueue[0]) && (this.actionQueue[0].action == 'move')) {
					var sprintChance = this.stats.values.sprintChance || 0;
					if (~~(Math.random() * 100) < sprintChance) {
						q = this.dequeue();
						q.isDouble = true;
					}
				}
				var success = this.performMove(q);
				if (!success) {
					this.clearQueue();
				}
			} else if (q.action == 'clearQueue')
				this.clearQueue();
			else if (q.action == 'spell') {
				var success = this.spellbook.cast(q);
				if (!success)
					this.performQueue();
			}
		},
		performMove: function(action) {
			var data = action.data;
			var physics = this.instance.physics;

			if (physics.isTileBlocking(data.x, data.y))
				return false;

			data.success = true;
			this.fireEvent('beforeMove', data);
			if (data.success == false) {
				action.priority = true;
				this.queue(action);
				return true;
			}

			if (!action.isDouble) {
				var deltaX = Math.abs(this.x - data.x);
				var deltaY = Math.abs(this.y - data.y);
				if (
					((deltaX > 1) || (deltaY > 1)) ||
					((deltaX == 0) && (deltaY == 0))
				)
					return false;
			}

			//Don't allow mob overlap during combat
			if ((this.mob) && (this.mob.target)) {
				if (physics.addObject(this, data.x, data.y)) {
					physics.removeObject(this, this.x, this.y);

					this.x = data.x;
					this.y = data.y;
				} else
					return false;
			} else {
				physics.removeObject(this, this.x, this.y, data.x, data.y);
				physics.addObject(this, data.x, data.y, this.x, this.y);
				this.x = data.x;
				this.y = data.y;
			}

			var syncer = this.syncer;
			syncer.o.x = this.x;
			syncer.o.y = this.y;

			if (this.aggro)
				this.aggro.move();

			return true;
		},

		collisionEnter: function(obj) {
			var components = this.components;
			var cLen = components.length;
			for (var i = 0; i < cLen; i++) {
				var c = components[i];
				if (c.collisionEnter) {
					if (c.collisionEnter(obj))
						return true;
				}
			}
		},
		collisionExit: function(obj) {
			var components = this.components;
			var cLen = components.length;
			for (var i = 0; i < cLen; i++) {
				var c = components[i];
				if (c.collisionExit)
					c.collisionExit(obj);
			}
		},

		fireEvent: function(event) {
			var args = [].slice.call(arguments, 1);

			var components = this.components;
			var cLen = components.length;
			for (var i = 0; i < cLen; i++) {
				var cpn = components[i];
				var events = cpn.events;
				if (!events)
					continue;

				var callback = events[event];
				if (!callback)
					continue;

				callback.apply(cpn, args);
			}

			if (this.effects)
				this.effects.fireEvent(event, args);
			if (this.quests)
				this.quests.fireEvent(event, args);
			if (this.prophecies)
				this.prophecies.fireEvent(event, args);
			if (this.inventory)
				this.inventory.fireEvent(event, args);
		},

		destroy: function() {
			var components = this.components;
			var len = components.length;
			for (var i = 0; i < len; i++) {
				var c = components[i];
				if (c.destroy)
					c.destroy();
			}
		}
	};
});