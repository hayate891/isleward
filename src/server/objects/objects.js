define([
	'objects/objBase',
	'leaderboard/leaderboard'
], function(
	objBase,
	leaderboard
) {
	return {
		nextId: 0,

		objects: [],

		init: function(_instance) {
			this.instance = _instance;
			this.physics = this.instance.physics;
		},

		getNextId: function() {
			return this.nextId++;
		},

		build: function(skipPush, clientObj) {
			var o = extend(true, {}, objBase);

			if (clientObj)
				o.update = null;
			else {
				o.id = this.nextId++;
				o.addComponent('syncer');
				o.instance = this.instance;

				if (!skipPush)
					this.objects.push(o);
			}

			return o;
		},

		transferObject: function(o) {
			var obj = this.build();

			var components = o.components;
			delete o.components;
			delete o.id;

			for (var p in o) {
				obj[p] = o[p];
			}

			var cLen = components.length;
			for (var i = 0; i < cLen; i++) {
				var c = components[i];

				var cpn = obj.addComponent(c.type, null, true);

				for (var p in c) {
					cpn[p] = c[p];
				}

				if (cpn.transfer)
					cpn.transfer();
			}

			return obj;
		},

		buildObjects: function(list, skipPush) {
			var lLen = list.length;
			for (var i = 0; i < lLen; i++) {
				var l = list[i];

				var obj = this.build(skipPush, l.clientObj);

				obj.sheetName = l.sheetName;
				obj.cell = l.cell;
				obj.name = l.name;

				obj.x = l.x;
				obj.y = l.y;

				if (l.width) {
					obj.width = l.width;
					obj.height = l.height;
				}

				//Add components (certain ones need to happen first)
				//TODO: Clean this part up
				var properties = extend(true, {}, l.properties);
				['cpnMob'].forEach(function(c) {
					var blueprint = properties[c] || null;
					if ((blueprint) && (typeof(blueprint) == 'string'))
						blueprint = JSON.parse(blueprint);

					if (!blueprint)
						return;

					delete properties[c];

					var type = c.replace('cpn', '').toLowerCase();

					obj.addComponent(type, blueprint);
				}, this);

				for (var p in properties) {
					if (p.indexOf('cpn') == -1) {
						obj[p] = properties[p];
						continue;
					}

					var type = p.replace('cpn', '').toLowerCase();
					var blueprint = properties[p] || null;
					if ((blueprint) && (typeof(blueprint) == 'string'))
						blueprint = JSON.parse(blueprint);

					obj.addComponent(type, blueprint);
				}

				var extraProperties = l.extraProperties || {};
				for (var p in extraProperties) {
					var cpn = obj[p];
					var e = extraProperties[p];
					for (var pp in e) {
						cpn[pp] = e[pp];
					}
					if (cpn.init)
						cpn.init();
				}

				if (this.physics) {
					if (!obj.width)
						this.physics.addObject(obj, obj.x, obj.y);
					else
						this.physics.addRegion(obj);
				}

				if (lLen == 1)
					return obj;
			}
		},

		find: function(callback) {
			return this.objects.find(callback);
		},

		removeObject: function(obj, callback, useServerId) {
			var objects = this.objects;
			var oLen = objects.length
			var found = null;
			for (var i = 0; i < oLen; i++) {
				var o = objects[i];
				var match = false;
				if (useServerId)
					match = (o.serverId == obj.id)
				else
					match = (o.id == obj.id);

				if (match) {
					o.destroy();
					found = o;
					objects.splice(i, 1);
					break;
				}
			}

			if (this.physics)
				this.physics.removeObject(found, found.x, found.y);

			callback && callback(found);
		},

		addObject: function(o, callback) {
			var newO = this.build(true);

			var components = o.components;

			delete o.components;

			for (var p in o) {
				newO[p] = o[p];
			}

			var len = components.length;
			for (var i = 0; i < len; i++) {
				var c = components[i];

				newO.addComponent(c.type, c);

				var newC = newO[c.type];
				for (var p in c) {
					newC[p] = c[p];
				}
			}

			this.objects.push(newO);
			this.physics.addObject(newO, newO.x, newO.y);

			callback(newO);

			return newO;
		},
		sendEvent: function(msg) {
			var player = this.objects.find(p => p.id == msg.id);
			if (!player)
				return;

			player.socket.emit('event', {
				event: msg.data.event,
				data: msg.data.data
			});
		},
		sendEvents: function(msg) {
			var players = {};
			var objects = this.objects;

			var data = msg.data;
			for (var e in data) {
				var event = data[e];
				var eLen = event.length;

				for (var j = 0; j < eLen; j++) {
					var eventEntry = event[j];

					var obj = eventEntry.obj;

					if (e != 'serverModule') {
						var to = eventEntry.to;
						var toLen = to.length;
						for (var i = 0; i < toLen; i++) {
							var toId = to[i];

							var player = players[toId];
							if (!player) {
								var findPlayer = objects.find(o => o.id == toId);
								if (!findPlayer)
									continue;
								else
									player = (players[toId] = {
										socket: findPlayer.socket,
										events: {}
									});
							}

							var eventList = player.events[e] || (player.events[e] = []);
							eventList.push(obj);
						}
					}
					else
						global[obj.module][obj.method](obj.msg);
				}
			}

			for (var p in players) {
				var player = players[p];
				player.socket.emit('events', player.events);
			}
		},
		updateObject: function(msg) {
			var player = this.objects.find(p => p.id == msg.serverId);
			if (!player)
				return;

			var obj = msg.obj;
			for (var p in obj) {
				player[p] = obj[p];
			}

			if (obj.dead)
				leaderboard.killCharacter(player.name);

			if (obj.level) {
				leaderboard.setLevel(player.name, obj.level);

				io.sockets.emit('events', {
					onGetMessages: [{
						messages: [{
							class: 'q1',
							message: player.name + ' has reached level ' + obj.level
						}]
					}],
					onGetConnectedPlayer: [cons.getCharacterList()]
				});
			}
		},
		update: function() {
			var objects = this.objects;
			var len = objects.length;

			for (var i = 0; i < len; i++) {
				var o = objects[i];

				//Don't remove it from the list if it's destroyed, but don't update it either
				//That's syncer's job
				if ((o.update) && (!o.destroyed))
					o.update();
			}
		}
	};
});