define([
	'world/atlas',
	'config/classes',
	'config/roles'
], function(
	atlas,
	classes,
	roles
) {
	return {
		type: 'player',

		seen: [],
		cdSave: 1000,
		cdSaveMax: 1000,

		update: function() {
			if (this.cdSave > 0)
				this.cdSave--;
			else {
				this.cdSave = this.cdSaveMax;
				this.obj.auth.doSave();
			}
		},

		spawn: function(character) {
			var obj = this.obj;
			extend(true, obj, {
				sheetName: classes.getSpritesheet(character.class),
				layerName: 'mobs',
				cell: character.cell,
				previewSpritesheet: character.previewSpritesheet,
				name: character.name,
				class: character.class,
				zoneName: character.zoneName || 'tutorial-cove',
				x: character.x,
				y: character.y,
				account: character.account,
				instanceId: character.instanceId
			});

			character.components = character.components || [];

			roles.onBeforePlayerEnterGame(obj, character);

			var blueprintStats = character.components.find(c => c.type == 'stats') || {};
			extend(true, blueprintStats, classes.stats[obj.class]);
			blueprintStats.values.hpMax = 10 + ((blueprintStats.values.level || 1) * 40);
			if (!blueprintStats.values.hp)
				blueprintStats.values.hp = blueprintStats.values.hpMax;
			var stats = obj.addComponent('stats');
			for (var s in blueprintStats.values) {
				stats.values[s] = blueprintStats.values[s];
			}
			for (var s in blueprintStats.stats) {
				stats.stats[s] = blueprintStats.stats[s];
			}
			stats.vitScale = blueprintStats.vitScale;

			stats.stats.logins++;

			//obj.addComponent('spellbook', { spells: extend(true, [], classes.spells[obj.class]) });
			obj.addComponent('spellbook');

			obj.addComponent('dialogue');
			obj.addComponent('trade', character.components.find(c => c.type == 'trade'));
			obj.addComponent('reputation', character.components.find(c => c.type == 'reputation'));

			obj.addComponent('social');
			obj.addComponent('aggro', {
				faction: 1
			});
			obj.addComponent('gatherer');
			obj.addComponent('stash', {
				items: character.stash
			});
			obj.addComponent('effects', blueprintEffects);

			var prophecies = character.components.find(c => c.type == 'prophecies');
			if (prophecies)
				obj.addComponent('prophecies', prophecies);

			obj.addComponent('equipment', character.components.find(c => c.type == 'equipment'));
			obj.addComponent('inventory', character.components.find(c => c.type == 'inventory'));
			obj.addComponent('quests', character.components.find(c => c.type == 'quests'));

			var blueprintEffects = character.components.find(c => c.type == 'effects') || {};
			if (blueprintEffects.effects) {
				//Calculate ttl of effects
				var time = +new Date;
				blueprintEffects.effects.filter(function(e) {
					var remaining = e.expire - time;
					if (remaining < 0)
						return false;
					else {
						e.ttl = Math.max(~~(remaining / 350), 1);
						delete e.expire;
						return true;
					}
				});
			}

			obj.xp = stats.values.xp;
			obj.level = stats.values.level;

			atlas.addObject(obj, true);

			io.sockets.emit('events', {
				onGetMessages: [{
					messages: [{
						class: 'q3',
						message: obj.name + ' has come online'
					}]
				}],
				onGetConnectedPlayer: [cons.getCharacterList()]
			});
		},

		broadcastSelf: function() {
			var obj = this.obj;

			var self = {
				id: obj.id,
				zone: obj.zone,
				name: obj.name,
				level: obj.level,
				class: obj.class
			};

			io.sockets.emit('events', {
				onGetConnectedPlayer: [self]
			});
		},

		hasSeen: function(id) {
			return (this.seen.indexOf(id) > -1);
		},
		see: function(id) {
			this.seen.push(id);
		},
		unsee: function(id) {
			this.seen.spliceWhere(s => s == id);
		},

		die: function(source, permadeath) {
			this.obj.clearQueue();

			var physics = this.obj.instance.physics;

			physics.removeObject(this.obj, this.obj.x, this.obj.y);

			if (!permadeath) {
				this.obj.x = this.obj.spawn.x;
				this.obj.y = this.obj.spawn.y;

				var syncer = this.obj.syncer;
				syncer.o.x = this.obj.x;
				syncer.o.y = this.obj.y;

				physics.addObject(this.obj, this.obj.x, this.obj.y);

				this.obj.stats.die(source);
			}
			else
				this.obj.stats.dead = true;

			this.obj.aggro.die();
			this.obj.spellbook.die();
			this.obj.effects.die();

			this.obj.aggro.move();
		},

		move: function(msg) {
			atlas.queueAction(this.obj, {
				action: 'move',
				data: msg.data
			});
		},
		moveList: function(msg) {
			atlas.queueAction(this.obj, {
				action: 'move',
				list: true,
				data: msg.data
			});
		},
		queueAction: function(msg) {
			atlas.queueAction(this.obj, msg.data);
		},
		performAction: function(msg) {
			if (msg.callback)
				msg.data.data.callbackId = atlas.registerCallback(msg.callback);

			atlas.performAction(this.obj, msg.data);
		}
	};
});