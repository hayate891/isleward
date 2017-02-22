define([

], function(

) {
	return {
		type: 'stats',

		values: {
			mana: 10,
			manaMax: 10,
			hp: 5,
			hpMax: 5,
			xpTotal: 0,
			xp: 0,
			xpMax: 0,
			level: 1,
			str: 0,
			int: 0,
			dex: 0,
			magicFind: 0,
			regenHp: 0,
			regenMana: 10,
			addCritChance: 0,
			critChance: 5,
			armor: 0,
			dmgPercent: 0,

			elementArcanePercent: 0,
			elementFrostPercent: 0,
			elementFirePercent: 0,
			elementHolyPercent: 0,
			elementPhysicalPercent: 0,
			elementPoisonPercent: 0,

			elementArcaneResist: 0,
			elementFrostResist: 0,
			elementFireResist: 0,
			elementHolyResist: 0,
			elementPhysicalResist: 0,
			elementPoisonResist: 0,

			elementAllResist: 0,

			sprintChance: 0,

			xpIncrease: 0
		},

		vitScale: 10,

		syncer: null,

		stats: {
			logins: 0,
			played: 0
		},

		dead: false,

		init: function(blueprint) {
			this.syncer = this.obj.instance.syncer;

			var values = (blueprint || {}).values || {};
			for (var v in values) {
				this.values[v] = values[v];
			}

			this.calcXpMax();
		},

		resetHp: function() {
			var values = this.values;
			values.hp = values.hpMax;

			this.obj.syncer.setObject(false, 'stats', 'values', 'hp', values.hp);
		},

		update: function() {
			if ((this.obj.mob) || (this.dead))
				return;

			var regen = {
				success: true
			};
			this.obj.fireEvent('beforeRegen', regen);
			if (!regen.success)
				return;

			var values = this.values;
			var isInCombat = (this.obj.aggro.list.length > 0);

			var regenHp = 0;
			var regenMana = 0;

			regenMana = (values.manaMax / 200) + (values.regenMana / 200);

			if (!isInCombat)
				regenHp = values.hpMax / 100;
			else
				regenHp = values.regenHp * 0.3;

			if (values.hp < values.hpMax) {
				values.hp += regenHp;
				this.obj.syncer.setObject(false, 'stats', 'values', 'hp', this.values.hp);
			}

			if (values.hp > values.hpMax) {
				values.hp = values.hpMax;
				this.obj.syncer.setObject(false, 'stats', 'values', 'hp', values.hp);
			}

			if (values.mana < values.manaMax) {
				values.mana += regenMana;
				//Show others what mana is?
				var onlySelf = true;
				if (this.obj.player)
					onlySelf = false;
				this.obj.syncer.setObject(onlySelf, 'stats', 'values', 'mana', values.mana);
			}

			if (values.mana > values.manaMax) {
				values.mana = values.manaMax;
				if (this.obj.player)
					onlySelf = false;
				this.obj.syncer.setObject(onlySelf, 'stats', 'values', 'mana', values.mana);
			}
		},

		addStat: function(stat, value) {
			this.values[stat] += value;

			var sendOnlyToSelf = (['hp', 'hpMax', 'mana', 'manaMax'].indexOf(stat) == -1);

			this.obj.syncer.setObject(sendOnlyToSelf, 'stats', 'values', stat, this.values[stat]);

			if (stat == 'addCritChance') {
				this.values.critChance += (0.05 * value);
				this.obj.syncer.setObject(true, 'stats', 'values', 'critChance', this.values.critChance);
			} else if (stat == 'vit') {
				this.values.hpMax += (value * this.vitScale);
				this.obj.syncer.setObject(true, 'stats', 'values', 'hpMax', this.values.hpMax);
			} else if (stat == 'allAttributes') {
				['int', 'str', 'dex'].forEach(function(s) {
					this.values[s] += value;
					this.obj.syncer.setObject(true, 'stats', 'values', s, this.values[s]);
				}, this);
			}
		},

		calcXpMax: function() {
			var level = this.values.level;
			this.values.xpMax = ~~(level * 10 * Math.pow(level, 1.75));

			this.obj.syncer.setObject(true, 'stats', 'values', 'xpMax', this.values.xpMax);
		},

		getXp: function(amount) {
			amount = ~~(amount * (1 + (this.values.xpIncrease / 100)));

			this.values.xpTotal = ~~(this.values.xpTotal + amount);
			this.values.xp = ~~(this.values.xp + amount);

			this.syncer.queue('onGetDamage', {
				id: this.obj.id,
				event: true,
				text: '+' + amount + ' xp'
			});

			var syncO = {};

			var didLevelUp = false;
			while (this.values.xp >= this.values.xpMax) {
				didLevelUp = true;
				this.values.xp -= this.values.xpMax;
				this.values.level++;

				this.values.hpMax += 40;

				this.syncer.queue('onGetDamage', {
					id: this.obj.id,
					event: true,
					text: 'level up'
				});

				this.obj.syncer.setObject(true, 'stats', 'values', 'level', this.values.level);
				this.obj.syncer.setObject(true, 'stats', 'values', 'hpMax', this.values.hpMax);

				syncO.level = this.values.level;

				this.calcXpMax();
			}

			if (didLevelUp)
				this.obj.auth.doSave();

			this.obj.syncer.setObject(true, 'stats', 'values', 'xp', this.values.xp);

			process.send({
				method: 'object',
				serverId: this.obj.serverId,
				obj: syncO
			});
		},

		kill: function(target) {
			var level = target.stats.values.level;
			var inc = level * 10;

			//Who should get xp?
			var aggroList = target.aggro.list;
			var hpMax = target.stats.values.hpMax;
			var aLen = aggroList.length;
			for (var i = 0; i < aLen; i++) {
				var a = aggroList[i];
				var dmg = a.damage;
				if (dmg <= 0)
					continue;

				var get = inc;
				//How many party members contributed
				// Remember, maybe one of the aggro-ees might be a mob too
				var party = a.obj.social ? a.obj.social.party : null;
				if (party) {
					var mult = aggroList.filter(function(f) {
						return ((a.damage > 0) && (party.indexOf(f.obj.serverId) > -1));
					}).length;
					mult--;
					get *= (1 + (mult * 0.1));
					get = ~~get;
				}

				if (a.obj.stats)
					a.obj.stats.getXp(inc);
				else {
					console.log('give xp to???');
					console.log(a.obj);
				}
	
				a.obj.fireEvent('afterKillMob', target);
			}

			target.fireEvent('afterDeath');
		},

		die: function(source) {
			this.values.hp = this.values.hpMax;
			this.values.mana = this.values.manaMax;

			this.obj.syncer.setObject(false, 'stats', 'values', 'hp', this.values.hp);
			this.obj.syncer.setObject(false, 'stats', 'values', 'mana', this.values.mana);

			this.syncer.queue('onGetDamage', {
				id: this.obj.id,
				event: true,
				text: 'death'
			});

			this.syncer.queue('onDeath', {
				x: this.obj.x,
				y: this.obj.y,
				source: source.name
			}, [this.obj.serverId]);
		},
		takeDamage: function(damage, threatMult, source) {
			source.fireEvent('beforeDealDamage', damage, this.obj);
			this.obj.fireEvent('beforeTakeDamage', damage, source);

			//Maybe the attacker was stunned?
			if (damage.failed)
				return;

			//Maybe something else killed this mob already?
			if (this.obj.destroyed)
				return;

			var amount = damage.amount;

			if (amount > this.values.hp)
				amount = this.values.hp;

			this.values.hp -= amount;

			var recipients = [];
			if (this.obj.serverId != null)
				recipients.push(this.obj.serverId);
			if (source.serverId != null)
				recipients.push(source.serverId);
			if (recipients.length > 0) {
				this.syncer.queue('onGetDamage', {
					id: this.obj.id,
					source: source.id,
					crit: damage.crit,
					amount: amount
				}, recipients);
			}

			this.obj.aggro.tryEngage(source, amount, threatMult);

			var died = (this.values.hp <= 0);

			if (died) {
				var death = {
					success: true
				};
				this.obj.fireEvent('beforeDeath', death);

				if (death.success) {
					var deathEvent = {};

					if (source.player)
						source.stats.kill(this.obj);
					else
						this.obj.fireEvent('afterDeath', deathEvent);

					if (this.obj.player) {
						this.obj.syncer.setObject(false, 'stats', 'values', 'hp', this.values.hp);
						if (deathEvent.permadeath) {
							this.obj.auth.permadie();

							this.syncer.queue('onPermadeath', {
								source: source.name
							}, [this.obj.serverId]);
						} else
							this.values.hp = 0;

						this.obj.player.die(source, deathEvent.permadeath);
					} else {
						this.obj.effects.die();
						if (this.obj.spellbook)
							this.obj.spellbook.die();
						this.obj.destroyed = true;

						if (this.obj.inventory) {
							var aggroList = this.obj.aggro.list;
							var aLen = aggroList.length;
							var done = [];
							for (var i = 0; i < aLen; i++) {
								var a = aggroList[i].obj;
								if (done.some(d => d == a.serverId))
									continue;

								if ((a.social) && (a.social.party)) {
									a.social.party.forEach(function(p) {
										if (done.some(d => d == p))
											return;

										this.obj.inventory.dropBag(p, source);
										done.push(p);
									}, this);
								} else {
									if (a.serverId == null)
										continue;

									this.obj.inventory.dropBag(a.serverId, source);
									done.push(a.serverId);
								}
							}
						}
					}
				}
			} else {
				source.aggro.tryEngage(this.obj, 0);
				this.obj.syncer.setObject(false, 'stats', 'values', 'hp', this.values.hp);
			}

			source.fireEvent('afterDealDamage', damage, this.obj);
		},

		getHp: function(heal, source) {
			var values = this.values;
			var hpMax = values.hpMax;

			if (values.hp >= hpMax)
				return;

			var amount = heal.amount;
			if (hpMax - values.hp < amount)
				amount = hpMax - values.hp;

			values.hp += amount;
			if (values.hp > hpMax)
				values.hp = hpMax;

			var recipients = [];
			if (this.obj.serverId != null)
				recipients.push(this.obj.serverId);
			if (source.serverId != null)
				recipients.push(source.serverId);
			if (recipients.length > 0) {
				this.syncer.queue('onGetDamage', {
					id: this.obj.id,
					source: source.id,
					heal: true,
					amount: amount,
					crit: heal.crit
				}, recipients);
			}

			//Add aggro to all our attackers
			var threat = amount * 0.4;
			var aggroList = this.obj.aggro.list;
			var aLen = aggroList.length;
			for (var i = 0; i < aLen; i++) {
				var a = aggroList[i].obj;
				a.aggro.tryEngage(source, threat);
			}

			this.obj.syncer.setObject(false, 'stats', 'values', 'hp', values.hp);
		},

		save: function() {
			if (this.sessionDuration) {
				this.stats.played = ~~(this.stats.played + this.sessionDuration);
				delete this.sessionDuration;
			}

			return {
				type: 'stats',
				values: this.values,
				stats: this.stats
			};
		},

		simplify: function(self) {
			var values = this.values;

			if (!self) {
				var result = {
					type: 'stats',
					values: {
						hp: values.hp,
						hpMax: values.hpMax,
						mana: values.mana,
						manaMax: values.manaMax,
						level: values.level
					}
				};

				return result
			}

			return {
				type: 'stats',
				values: values,
				stats: this.stats,
				vitScale: this.vitScale
			};
		}
	};
});