define([

], function(

) {
	return {
		type: 'aggro',

		range: 7,
		faction: null,

		physics: null,

		list: [],
		ignoreList: [],

		init: function(blueprint) {
			this.physics = this.obj.instance.physics;

			blueprint = blueprint || {};

			if (blueprint.faction) {
				this.faction = blueprint.faction;
			}

			//TODO: Why don't we move if faction is null?
			if (this.faction == null)
				return;

			if (this.physics.width > 0)
				this.move();
			else {
				//HACK: Don't fire on main thread (no physics set up)
				console.log('HACK: cpn/aggro');
			}
		},

		events: {
			beforeRezone: function() {
				this.die();
			}
		},

		simplify: function(self) {
			return {
				type: 'aggro',
				faction: this.faction
			};
		},

		move: function() {
			var result = {
				success: true
			};
			this.obj.fireEvent('beforeAggro', result);
			if (!result.success)
				return;

			var obj = this.obj;

			//If we're attacking something, don't try and look for more trouble. SAVE THE CPU!
			// this only counts for mobs, players can have multiple attackers
			var list = this.list;
			if (obj.isMob) {
				var lLen = list.length;
				for (var i = 0; i < lLen; i++) {
					var l = list[i];

					var lThreat = l.obj.aggro.getHighest();
					if (lThreat) {
						l.obj.aggro.list.forEach(function(a) {
							a.obj.aggro.unIgnore(lThreat);
						});
					}

					l.obj.aggro.unIgnore(obj);
					if (l.threat > 0)
						return;
				}
			} else {
				var lLen = list.length;
				for (var i = 0; i < lLen; i++) {
					list[i].obj.aggro.unIgnore(obj);
				}
			}

			var x = obj.x;
			var y = obj.y;

			//find mobs in range
			var range = this.range;
			var faction = this.faction;
			var inRange = this.physics.getArea(x - range, y - range, x + range, y + range, (c => (((!c.player) || (!obj.player)) && (c.aggro) && (c.aggro.willAttack(obj)))));

			if (inRange.length == 0)
				return;

			var iLen = inRange.length;
			for (var i = 0; i < iLen; i++) {
				var enemy = inRange[i];

				//The length could change
				lLen = list.length;
				for (var j = 0; j < lLen; j++) {
					//Set the enemy to null so we need we need to continue
					if (list[j].obj == enemy)
						enemy = null;
				}
				if (!enemy)
					continue;

				//Do we have LoS?
				if (!this.physics.hasLos(x, y, enemy.x, enemy.y))
					continue;

				if (enemy.aggro.tryEngage(obj))
					this.tryEngage(enemy, 0);
			}
		},

		willAttack: function(target) {
			if (this.obj = target)
				return false;

			var faction = target.aggro.faction;
			if (faction == null)
				return false;

			if ((target.player) && (this.obj.player))
				return ((this.obj.prophecies.hasProphecy('butcher')) && (target.prophecies.hasProphecy('butcher')));

			var rep = this.obj.reputation;
			if (!rep) {
				var targetRep = target.reputation;
				if (!targetRep)
					return false;
				else
					return (targetRep.getTier(this.faction) < 3);
			}

			return (rep.getTier(faction) < 3);
		},

		ignore: function(obj) {
			this.ignoreList.spliceWhere(o => o == obj);
			this.ignoreList.push(obj);
		},

		unIgnore: function(obj) {
			this.ignoreList.spliceWhere(o => o == obj);
		},

		tryEngage: function(obj, amount, threatMult) {
			var result = {
				success: true
			};
			this.obj.fireEvent('beforeAggro', result);
			if (!result.success)
				return false;

			var oId = obj.id;
			var list = this.list;

			amount = amount || 0;
			threatMult = threatMult || 1;

			var exists = list.find(l => l.obj.id == oId);
			if (exists) {
				exists.damage += amount;
				exists.threat += amount * threatMult;
			} else {
				var l = {
					obj: obj,
					damage: amount,
					threat: amount * threatMult
				};

				list.push(l);
			}

			//this.sortThreat();

			return true;
		},

		getFirstAttacker: function() {
			var first = this.list.find(l => ((l.obj.player) && (l.damage > 0)));
			if (first)
				return first.obj;
			else
				return null;
		},

		die: function() {
			var list = this.list;
			var lLen = list.length;

			for (var i = 0; i < lLen; i++) {
				var l = list[i];
				if (!l) {
					console.log('aggro obj empty???');
					continue;
				}
				l.obj.aggro.unAggro(this.obj);
			}

			this.list = [];
		},
		unAggro: function(obj, amount) {
			var oId = obj.id;
			var list = this.list;
			var lLen = list.length;

			for (var i = 0; i < lLen; i++) {
				var l = list[i];

				if (l.obj != obj)
					continue;

				if (amount == null) {
					list.splice(i, 1);
					break;
				} else {
					l.threat -= amount;
					if (l.threat <= 0) {
						list.splice(i, 1);
						break;
					}
				}
			}

			this.ignoreList.spliceWhere(o => o == obj);

			//Stuff like cocoons don't have spellbooks
			if (this.obj.spellbook)
				this.obj.spellbook.unregisterCallback(obj.id, true);

			if ((this.list.length == 0) && (this.obj.mob))
				this.obj.stats.resetHp();
		},

		sortThreat: function() {
			this.list.sort(function(a, b) {
				return (b.threat - a.threat);
			});
		},

		getHighest: function() {
			if (this.list.length == 0)
				return null;

			var list = this.list;
			var lLen = list.length;

			var highest = null;
			var closest = 99999;

			var thisObj = this.obj;
			var x = thisObj.x;
			var y = thisObj.y;

			for (var i = 0; i < lLen; i++) {
				var l = list[i];
				var obj = l.obj;

				if (this.ignoreList.some(o => o == obj))
					continue;

				if ((highest == null) || (l.threat > highest.threat)) {
					highest = l;
					closest = Math.max(Math.abs(x - obj.x), Math.abs(y - obj.y));
				} else if (l.threat == highest.threat) {
					var distance = Math.max(Math.abs(x - obj.x), Math.abs(y - obj.y));
					if (distance < closest) {
						highest = l;
						closest = distance;
					}
				}
			}

			if (highest)
				return highest.obj;
			else {
				//We have aggro but can't reach our target. Don't let the mob run away as if not in combat!
				return true;
			}
		},

		update: function() {
			var list = this.list;
			var lLen = list.length;

			for (var i = 0; i < lLen; i++) {
				var l = list[i];
				if (l.obj.destroyed) {
					list.splice(i, 1);
					i--;
					lLen--;
				}
			}
		}
	};
});