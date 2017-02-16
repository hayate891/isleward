define([
	'config/effects/effectTemplate'
], function(
	effectTemplate
) {
	return {
		type: 'effects',

		effects: [],
		nextId: 0,

		init: function(blueprint) {
			var effects = blueprint.effects || [];
			var eLen = effects.length;
			for (var i = 0; i < eLen; i++) {
				var e = effects[i];
				if (!e.type)
					continue;

				this.addEffect(e);
			}

			delete blueprint.effects;
		},

		transfer: function() {
			var transferEffects = this.effects;
			this.effects = [];

			this.init({
				effects: transferEffects
			});
		},

		save: function() {
			var e = {
				type: 'effects',
				effects: this.effects
					.map(e => e.save())
					.filter(e => e != null)
			};

			return e;
		},

		simplify: function(self) {
			var e = {
				type: 'effects'
			};

			var effects = this.effects;
			if ((effects.length > 0) && (effects[0].obj)) {
				effects = effects
					.map(e => e.simplify())
					.filter(e => e != null);
			}
			e.effects = effects;

			return e;
		},

		destroy: function() {
			if (this.obj.instance)
				this.events.beforeRezone.call(this);
		},

		die: function() {
			this.events.beforeRezone.call(this, true);
		},

		reset: function() {
			var effects = this.effects;
			var eLen = effects.length;
			for (var i = 0; i < eLen; i++) {
				var effect = effects[i];

				if (effect.reset)
					effect.reset();
			}
		},

		reapply: function() {
			var effects = this.effects;
			var eLen = effects.length;
			for (var i = 0; i < eLen; i++) {
				var effect = effects[i];

				if (effect.reapply)
					effect.reapply();
			}
		},

		events: {
			beforeRezone: function(forceDestroy) {
				var effects = this.effects;
				var eLen = effects.length;
				for (var i = 0; i < eLen; i++) {
					var effect = effects[i];
					if (!forceDestroy) {
						if (effect.persist) {
							this.syncRemove(effect.id, effect.type);
							continue;
						}
					}

					if (effect.destroy)
						effect.destroy();

					this.syncRemove(effect.id, effect.type);
					effects.splice(i, 1);
					eLen--;
					i--;
				}
			}
		},

		addEffect: function(options) {
			var exists = this.effects.find(e => e.type == options.type);
			if (exists) {
				exists.ttl += options.ttl;
				return exists;
			}

			var typeTemplate = null;
			if (options.type) {
				var type = options.type[0].toUpperCase() + options.type.substr(1);
				typeTemplate = require('config/effects/effect' + type + '.js');
			}

			var builtEffect = extend(true, {}, effectTemplate, typeTemplate);
			for (var p in options) {
				builtEffect[p] = options[p];
			}
			builtEffect.obj = this.obj;
			builtEffect.id = this.nextId++;
			builtEffect.noMsg = options.noMsg;

			if (builtEffect.init)
				builtEffect.init(options.source);

			this.effects.push(builtEffect);

			if (!options.noMsg) {
				this.obj.instance.syncer.queue('onGetBuff', {
					type: options.type,
					id: builtEffect.id
				}, [this.obj.serverId]);

				this.obj.instance.syncer.queue('onGetDamage', {
					id: this.obj.id,
					event: true,
					text: '+' + options.type
				});

				this.obj.syncer.setArray(false, 'effects', 'addEffects', options.type);
			}

			return builtEffect;
		},

		syncRemove: function(id, type, noMsg) {
			if ((noMsg) || (!type))
				return;

			this.obj.instance.syncer.queue('onRemoveBuff', {
				id: id
			}, [this.obj.serverId]);

			this.obj.instance.syncer.queue('onGetDamage', {
				id: this.obj.id,
				event: true,
				text: '-' + type
			});

			this.obj.syncer.setArray(false, 'effects', 'removeEffects', type);
		},

		removeEffect: function(checkEffect, noMsg) {
			var effects = this.effects;
			var eLen = effects.length;
			for (var i = 0; i < eLen; i++) {
				var effect = effects[i];
				if (effect == checkEffect) {
					this.syncRemove(effect.id, effect.type, noMsg || effect.noMsg);
					effects.splice(i, 1);
					return;
				}
			}
		},
		removeEffectByName: function(effectName, noMsg) {
			var effects = this.effects;
			var eLen = effects.length;
			for (var i = 0; i < eLen; i++) {
				var effect = effects[i];
				if (effect.type == effectName) {
					this.syncRemove(effect.id, effect.type, noMsg || effects.noMsg);
					effects.splice(i, 1);
					return;
				}
			}
		},

		fireEvent: function(event, args) {
			var effects = this.effects;
			var eLen = effects.length;
			for (var i = 0; i < eLen; i++) {
				var e = effects[i];
				if (e.ttl <= 0)
					continue;
				var events = e.events;
				if (!events)
					continue;

				var callback = events[event];
				if (!callback)
					continue;

				callback.apply(e, args);
			}
		},

		update: function() {
			var effects = this.effects;
			var eLen = effects.length;
			for (var i = 0; i < eLen; i++) {
				var e = effects[i];

				if (e.ttl > 0) {
					e.ttl--;
					if (e.ttl == 0)
						e.destroyed = true;
				}

				if (e.update)
					e.update();

				if (e.destroyed) {
					effects.splice(i, 1);
					eLen--;
					i--;

					if (e.destroy)
						e.destroy();

					this.syncRemove(e.id, e.type, e.noMsg);
				}
			}
		}
	};
});