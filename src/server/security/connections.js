define([
	'objects/objects',
	'world/atlas'
], function(
	objects,
	atlas
) {
	return {
		players: [],

		onHandshake: function(socket) {
			var p = objects.build();
			p.socket = socket;
			p.addComponent('auth');
			p.addComponent('player');

			this.players.push(p);
		},
		onDisconnect: function(socket) {
			var player = this.players.find(p => p.socket.id == socket.id);

			if (!player)
				return;

			var sessionDuration = 0;

			if (player.id != null) {
				if (player.social)
					player.social.dc();
				sessionDuration = ~~(((+new Date) - player.player.sessionStart) / 1000);
				atlas.updateObject(player, {
					components: [
						{
							type: 'stats',
							sessionDuration: sessionDuration
						}
					]
				});
				atlas.removeObject(player);
			}

			if (player.name) {
				io.sockets.emit('events', {
					onGetMessages: [{
						messages: [{
							class: 'q3',
							message: player.name + ' has gone offline'
						}]
					}],
					onGetDisconnectedPlayer: [player.id]
				});
			}

			this.players.spliceWhere(p => p.socket.id == socket.id);
		},
		route: function(socket, msg) {
			var player = null;

			if (msg.id != null) {
				player = this.players.find(p => p.id == msg.id);
				var source = this.players.find(p => p.socket.id == socket.id);
				if (!msg.data)
					msg.data = {};
				msg.data.sourceId = source.id;
			}
			else
				player = this.players.find(p => p.socket.id == socket.id);

			if (!player)
				return;

			var cpn = player[msg.cpn];
			if (!cpn)
				return;

			if (cpn[msg.method])
				cpn[msg.method](msg);
		},
		unzone: function(msg) {
			var socket = msg.socket;
			var player = this.players.find(p => p.socket.id == socket.id);

			if (!player)
				return;

			if (player.social)
				player.social.dc();
			atlas.removeObject(player, true);

			var keys = Object.keys(player);
			keys.forEach(function(k) {
				var val = player[k];
				if ((val != null) && (typeof(val) == 'object') && (val.type)) {
					var type = val.type;
					if ((type != 'player') && (type != 'auth') && (type != 'syncer')) {
						delete player[k];
					}
				}
			});

			io.sockets.emit('events', {
				onGetMessages: [{
					messages: [{
						class: 'q3',
						message: player.name + ' has gone offline'
					}]
				}],
				onGetDisconnectedPlayer: [player.id]
			});

			//If we don't do this, the atlas will try to remove it from the thread
			player.zoneName = null;
			player.name = null;
		},
		logOut: function(exclude) {
			var players = this.players;
			var pLen = players.length;
			for (var i = 0; i < pLen; i++) {
				var p = players[i];

				if ((!p) || (p == exclude) || (!p.auth))
					continue;

				if (p.auth.username == exclude.auth.username)
					p.socket.emit('dc', {});
			}
		},

		getCharacterList: function(msg) {
			var result = [];
			var players = this.players;
			var pLen = players.length;
			for (var i = 0; i < pLen; i++) {
				var p = players[i];
				if (!p.name)
					continue;

				result.push({
					zone: p.zone,
					name: p.name,
					level: p.level,
					class: p.class,
					id: p.id
				});
			}

			return result;
		}
	};
});