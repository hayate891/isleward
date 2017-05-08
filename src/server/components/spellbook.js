define([
	'./../config/spells/spellTemplate',
	'./../config/animations',
	'./../config/spells',
	'./../config/spellsConfig',
	'misc/events'
], function(
	spellTemplate,
	animations,
	playerSpells,
	playerSpellsConfig,
	events
) {
	return {
		type: 'spellbook',

		spells: [],
		auto: [],

		physics: null,
		objects: null,

		closestRange: -1,
		furthestRange: -1,

		callbacks: [],

		init: function(blueprint) {
			this.objects = this.obj.instance.objects;
			this.physics = this.obj.instance.physics;

			var spells = blueprint.spells || [];
			spells.forEach(function(s) {
				this.addSpell(s);
			}, this);

			this.dmgMult = blueprint.dmgMult;

			delete blueprint.spells;
		},

		transfer: function() {
			var spells = this.spells;
			this.spells = [];

			spells.forEach(function(s) {
				this.addSpell(s);
			}, this);
		},

		die: function() {
			this.auto = [];

			this.spells.forEach(function(s) {
				s.die();
			});
		},

		simplify: function(self) {
			if (!self)
				return null;

			var s = {
				type: this.type,
				closestRange: this.closestRange,
				furthestRange: this.furthestRange
			};

			var spells = this.spells;
			if ((spells.length > 0) && (spells[0].obj)) {
				spells = spells.map(s => s.simplify());
			}
			s.spells = spells;

			return s;
		},

		addSpell: function(options, spellId) {
			if (!options.type) {
				options = {
					type: options
				};
			}

			var type = options.type[0].toUpperCase() + options.type.substr(1);

			var typeTemplate = {
				type: type,
				template: null
			};
			events.emit('onBeforeGetSpellTemplate', typeTemplate);
			if (!typeTemplate.template)
				typeTemplate.template = require('./config/spells/spell' + type);

			var builtSpell = extend(true, {}, spellTemplate, typeTemplate.template, options);
			builtSpell.obj = this.obj;
			builtSpell.baseDamage = builtSpell.damage;
			builtSpell.damage += (options.damageAdd || 0);
			if (options.damage)
				builtSpell.damage = options.damage;

			if (builtSpell.animation) {
				var animation = null;
				var sheetName = this.obj.sheetName;
				var animationName = builtSpell.animation;

				if (sheetName == 'characters')
					animation = animations.classes[this.obj.class];
				else if (sheetName == 'mobs')
					animation = animations.mobs;
				else if (sheetName == 'bosses')
					animation = animations.bosses;

				if ((animation) && (animation[this.obj.cell]) && (animation[this.obj.cell][animationName])) {
					builtSpell.animation = extend(true, {}, animation[this.obj.cell][animationName]);
					builtSpell.animation.name = animationName;
				}
				else
					builtSpell.animation = null;
			}

			if ((this.closestRange == -1) || (builtSpell.range < this.closestRange))
				this.closestRange = builtSpell.range;
			if ((this.furthestRange == -1) || (builtSpell.range > this.furthestRange))
				this.furthestRange = builtSpell.range;

			var id = [0, 1, 2].find(function(s) {
				return (!this.spells.some(f => (f.id == s)));
			}, this);
			builtSpell.id = (spellId == null) ? id : spellId;

			if (spellId == null)
				this.spells.push(builtSpell);
			else
				this.spells.splice(spellId, 0, builtSpell);

			builtSpell.calcDps(null, true);
			if (builtSpell.init)
				builtSpell.init();

			if (this.obj.player) 
				this.obj.syncer.setArray(true, 'spellbook', 'getSpells', builtSpell.simplify());

			return builtSpell.id;
		},

		addSpellFromRune: function(runeSpell, spellId) {
			var name = runeSpell.name.toLowerCase();
			var playerSpell = playerSpells.find(s => s.name.toLowerCase() == name);
			var playerSpellConfig = playerSpellsConfig[name];

			if (!playerSpell)
				return -1;

			if (!runeSpell.rolls)
				runeSpell.rolls = {};

			runeSpell.values = {};
			
			var builtSpell = extend(true, {
				values: {}
			}, playerSpell, playerSpellConfig);

			for (var r in builtSpell.random) {
				var range = builtSpell.random[r];
				var roll = runeSpell.rolls[r] || 0;
				runeSpell.rolls[r] = roll;

				var int = r.indexOf('i_') == 0;

				var val = range[0] + ((range[1] - range[0]) * roll);
				if (int) {
					val = ~~val;
					r = r.replace('i_', '');
				}
				else
					val = ~~(val * 10) / 10;

				builtSpell[r] = val;
				builtSpell.values[r] = val;
				runeSpell.values[r] = val;
			}

			if (runeSpell.properties) {
				for (var p in runeSpell.properties) {
					builtSpell[p] = runeSpell.properties[p];
				}
			}

			if (runeSpell.cdMult)
				builtSpell.cdMax *= runeSpell.cdMult;

			delete builtSpell.rolls;
			delete builtSpell.random;

			return this.addSpell(builtSpell, spellId);
		},

		calcDps: function() {
			this.spells.forEach(s => s.calcDps());
		},

		removeSpellById: function(id) {
			this.spells.spliceWhere(s => (s.id == id));

			this.obj.syncer.setArray(true, 'spellbook', 'removeSpells', id);

			this.auto.spliceWhere(a => a.spell == id);
		},

		queueAuto: function(action) {
			if (!action.auto)
				return true;

			var exists = this.auto.find(a => (a.spell == action.spell));
			if (!exists) {
				this.auto.push({
					spell: action.spell,
					target: action.target
				});

				return true;
			}
			else
				exists.target = action.target;
		},
		getRandomSpell: function(target) {
			var valid = [];
			this.spells.forEach(function(s, i) {
				if (s.canCast(target))
					valid.push(i);
			});
			
			if (valid.length > 0)
				return valid[~~(Math.random() * valid.length)]
			else 
				return null;
		},
		cast: function(action, isAuto) {
			if (action.spell == null) {
				this.auto = [];
				return true;
			}

			var spell = this.spells[action.spell];
			if (!spell)
				return false;

			//Cast on self?
			if (action.self) {
				if (spell.targetGround) {
					action.target = {
						x: this.obj.x,
						y: this.obj.y
					};
				}
				else if (spell.spellType == 'buff') {
					action.target = this.obj;
				}
			}

			if (!spell.targetGround) {
				if (action.target == null) {
					console.log('NO TARGET');
					console.log(action);
					return false;
				}

				//Did we pass in the target id?
				if (action.target.id == null) {
					action.target = this.objects.objects.find(o => o.id == action.target);
					if (!action.target)
						return false;
				}

				if ((action.target.aggro) && (!this.obj.aggro.willAttack(action.target)) && (spell.spellType != 'buff')) {
					if ((this.obj.player) && (action.target.player))
						return;
				}
			}

			if ((!spell.targetGround) && (action.target) && (!action.target.aggro)) {
				this.sendAnnouncement("You don't feel like attacking that target");
				return;
			}

			var success = true;
			if (spell.cd > 0) {
				if ((!isAuto) && (!spell.isAuto))
					this.sendAnnouncement('Spell is on cooldown');
				success = false;
			} else if (spell.manaCost > this.obj.stats.values.mana) {
				if (!isAuto)
					this.sendAnnouncement('Insufficient mana to cast spell');
				success = false;
			} else if (spell.range != null) {
				//Distance Check
				var fromX = this.obj.x;
				var fromY = this.obj.y;
				var toX = action.target.x;
				var toY = action.target.y;
				var distance = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY));
				var range = spell.range;
				if ((spell.useWeaponRange) && (this.obj.player)) {
					var weapon = this.obj.inventory.findItem(this.obj.equipment.eq.twoHanded);
					if (weapon)
						range = weapon.range || 1;
				}

				if (distance > range) {
					if (!isAuto)
						this.sendAnnouncement('Target out of range');
					success = false;
				}
			}

			//LoS check
			//Null means we don't have LoS and as such, we should move
			if ((spell.needLos) && (success)) {
				if (!this.physics.hasLos(~~fromX, ~~fromY, ~~toX, ~~toY)) {
					if (!isAuto)
						this.sendAnnouncement('Target not in line of sight');
					action.auto = false;
					success = null;
				}
			}

			if (!success) {
				this.queueAuto(action);
				return success;
			} else if (!this.queueAuto(action))
				return false;

			var castSuccess = {
				success: true
			};
			this.obj.fireEvent('beforeCastSpell', castSuccess);
			if (!castSuccess.success)
				return false;

			success = spell.cast(action);

			if (success) {
				this.obj.stats.values.mana -= spell.manaCost;
				spell.cd = spell.cdMax;

				if (this.obj.player) {
					var syncer = this.obj.syncer;
					syncer.setObject(true, 'stats', 'values', 'mana', this.obj.stats.values.mana);
					this.obj.instance.syncer.queue('onGetSpellCooldowns', {
						id: this.obj.id,
						spell: action.spell,
						cd: (spell.cd * 350)
					}, [this.obj.serverId]);
				}
			}

			return success;
		},

		getClosestRange: function(spellNum) {
			if (spellNum)
				return this.spells[spellNum].range;
			else
				return this.closestRange;
		},

		getFurthestRange: function(spellNum) {
			if (spellNum)
				return this.spells[spellNum].range;
			else {
				var spells = this.spells;
				var sLen = spells.length;
				var furthest = 0;
				for (var i = 0; i < sLen; i++) {
					var spell = spells[i];
					if ((spell.range > furthest) && (spell.canCast()))
						furthest = spell.range;
				}
				if (furthest == 0) 
					furthest = this.furthestRange;
				
				return furthest;
			}
		},

		getCooldowns: function() {
			var cds = [];
			this.spells.forEach(
				s => cds.push({
					cd: s.cd,
					cdMax: s.cdMax,
					canCast: ((s.manaCost <= this.obj.stats.values.mana) && (s.cd == 0))
				}), this);

			return cds;
		},
		update: function() {
			this.spells.forEach(function(s, i) {
				s.updateBase();
				if (s.update)
					s.update();
			});

			var auto = this.auto;
			var aLen = auto.length;
			for (var i = 0; i < aLen; i++) {
				var a = auto[i];
				if ((!a.target) || (a.target.destroyed)) {
					auto.splice(i, 1);
					aLen--;
					i--;
					continue;
				}

				var spell = this.spells[a.spell];
				if (this.cast(a, true))
					return true;
			}

			var callbacks = this.callbacks;
			var cLen = callbacks.length;
			for (var i = 0; i < cLen; i++) {
				var c = callbacks[i];

				//If a spellCallback kills a mob he'll unregister his callbacks
				if (!c) {
					i--;
					cLen--;
					continue;
				}

				c.time -= 350;

				if (c.time <= 0) {
					if (c.callback)
						c.callback();
					if (c.destroyCallback)
						c.destroyCallback();
					callbacks.splice(i, 1);
					i--;
					cLen--;
				}
			}
		},

		registerCallback: function(sourceId, callback, time, destroyCallback, targetId, destroyOnRezone) {
			var obj = {
				sourceId: sourceId,
				targetId: targetId,
				callback: callback,
				destroyCallback: destroyCallback,
				destroyOnRezone: destroyOnRezone,
				time: time
			};

			this.callbacks.push(obj);

			return obj;
		},
		unregisterCallback: function(sourceId, target) {
			var callbacks = this.callbacks;
			var cLen = callbacks.length;
			for (var i = 0; i < cLen; i++) {
				var c = callbacks[i];

				var match = false;
				if (!target)
					match = (c.sourceId == sourceId);
				else {
					match = (c.targetId == sourceId);
				}

				if (match) {
					if (c.destroyCallback)
						c.destroyCallback();
					callbacks.splice(i, 1);
					i--;
					cLen--;
				}
			}
		},

		sendAnnouncement: function(msg, global) {
			process.send({
				method: 'events',
				data: {
					'onGetAnnouncement': [{
						obj: {
							msg: msg
						},
						to: [this.obj.serverId]
					}]
				}
			});
		},

		events: {
			beforeRezone: function() {
				var callbacks = this.callbacks;
				var cLen = callbacks.length;
				for (var i = 0; i < cLen; i++) {
					var c = callbacks[i];

					//If a spellCallback kills a mob he'll unregister his callbacks
					//Probably not needed since we aren't supposed to damage mobs in destroyCallback
					if (!c) {
						i--;
						cLen--;
						continue;
					}

					if (c.destroyOnRezone) {
						if (c.destroyCallback)
							c.destroyCallback();
						callbacks.splice(i, 1);
						i--;
						cLen--;
					}
				}
			}
		}
	};
});