define([
	'world/atlas',
	'config/roles'
], function(
	atlas,
	roles
) {
	return {
		type: 'social',

		isPartyLeader: null,
		partyLeaderId: null,
		party: null,

		init: function() {},

		simplify: function() {
			return {
				type: 'social',
				party: this.party
			};
		},

		sendMessage: function(msg) {
			this.obj.socket.emit('event', {
				event: 'onGetMessages',
				data: {
					messages: [{
						class: 'q0',
						message: msg,
						type: 'chat'
					}]
				}
			});
		},

		sendPartyMessage: function(msg) {
			if (!this.party) {
				this.obj.socket.emit('events', {
					onGetMessages: [{
						messages: [{
							class: 'q0',
							message: 'you are not in a party',
							type: 'info'
						}]
					}]
				});

				return;
			}

			var charname = this.obj.auth.charname;
			var message = msg.data.message.substr(1);

			this.party.forEach(function(p) {
				var player = cons.players.find(c => c.id == p);

				player.socket.emit('events', {
					onGetMessages: [{
						messages: [{
							class: 'q0',
							message: '(party: ' + charname + '): ' + message,
							type: 'chat'
						}]
					}]
				});
			}, this);
		},

		chat: function(msg) {
			var charname = this.obj.auth.charname;
			var level = this.obj.stats.values.level;
			if (level >= 10)
				level = 4;
			else if (level >= 6)
				level = 2;
			else
				level = 0;

			var msgStyle = roles.getRoleMessageStyle(this.obj) || ('q' + level);

			var messageString = msg.data.message;
			if (messageString[0] == '@') {
				var playerName = '';
				//Check if there's a space in the name
				if (messageString[1] == "'") {
					playerName = messageString.substring(2, messageString.indexOf("'", 2));
					messageString = messageString.replace("@'" + playerName + "' ", '');
				} else {
					playerName = messageString.substring(1, messageString.indexOf(' '));
					messageString = messageString.replace('@' + playerName + ' ', '');
				}

				if (playerName == this.obj.name)
					return;

				var target = cons.players.find(p => p.name == playerName);
				if (!target)
					return;

				this.obj.socket.emit('event', {
					event: 'onGetMessages',
					data: {
						messages: [{
							class: msgStyle,
							message: '(you to ' + playerName + '): ' + messageString,
							type: 'chat'
						}]
					}
				});

				target.socket.emit('event', {
					event: 'onGetMessages',
					data: {
						messages: [{
							class: msgStyle,
							message: '(' + this.obj.name + ' to you): ' + messageString,
							type: 'chat'
						}]
					}
				});
			} else if (messageString[0] == '%') {
				this.sendPartyMessage(msg);
			} else {
				var prefix = roles.getRoleMessagePrefix(this.obj) || '';

				io.sockets.emit('event', {
					event: 'onGetMessages',
					data: {
						messages: [{
							class: msgStyle,
							message: prefix + charname + ': ' + msg.data.message,
							type: 'chat'
						}]
					}
				});
			}
		},

		dc: function() {
			if (!this.party)
				return;

			this.leaveParty();
		},

		//This gets called on the target player
		getInvite: function(msg) {
			if (this.party)
				return;

			var obj = this.obj;
			var sourceId = msg.data.sourceId;

			if (sourceId == obj.id)
				return;

			var source = cons.players.find(c => c.id == sourceId);
			if (!source)
				return;

			source.social.sendMessage('invite sent');
			this.sendMessage(source.name + ' has invited you to join a party');

			this.obj.socket.emit('event', {
				event: 'onGetInvite',
				data: sourceId
			});
		},

		//This gets called on the player that initiated the invite
		acceptInvite: function(msg) {
			var sourceId = msg.data.sourceId;
			var source = cons.players.find(c => c.id == sourceId);
			if (!source)
				return;

			if (!this.party) {
				this.isPartyLeader = true;
				this.party = [this.obj.id];
				this.updatePartyOnThread();
			}

			// Only add if not yet in party
			if (!this.party.find(id => (id === sourceId)))
				this.party.push(sourceId);

			this.updatePartyOnThread();

			this.party.forEach(function(p) {
				var player = cons.players.find(c => c.id == p);
				player.social.party = this.party;
				player.social.updatePartyOnThread();

				var msg = source.name + ' has joined the party';
				if (p == sourceId)
					msg = 'you have joined a party';
				player.social.sendMessage(msg);

				player
					.socket.emit('event', {
						event: 'onGetParty',
						data: this.party
					});
			}, this);
		},
		declineInvite: function(msg) {
			var targetId = msg.data.targetId;
			var target = cons.players.find(c => c.id == targetId);
			if (!target)
				return;

			this.sendMessage(target.name + ' declined your party invitation');
		},

		//Gets called on the player that requested to leave
		leaveParty: function(msg) {
			var name = this.obj.name;

			this.party.spliceWhere(p => p == this.obj.id);

			this.party.forEach(function(p) {
				var player = cons.players.find(c => c.id == p);

				var messages = [{
					class: 'q0',
					message: name + ' has left the party'
				}];
				var party = this.party;
				if (this.party.length == 1) {
					messages.push({
						class: 'q0',
						message: 'your group has been disbanded'
					});

					player.social.isPartyLeader = false;
					player.social.party = null;
					player.social.updatePartyOnThread();
					party = null;
				}

				player.socket.emit('events', {
					onGetParty: [party],
					onGetMessages: [{
						messages: messages
					}]
				});
			}, this);

			this.obj.socket.emit('events', {
				onGetParty: [
					[]
				],
				onGetMessages: [{
					messages: {
						class: 'q0',
						message: 'you have left the party'
					}
				}]
			});

			if ((this.isPartyLeader) && (this.party.length >= 2)) {
				var newLeader = cons.players.find(c => c.id == this.party[0]).social;
				newLeader.isPartyLeader = true;
				this.party.forEach(function(p) {
					var msg = newLeader.obj.name + ' is now the party leader';
					if (p == newLeader.obj.id)
						msg = 'you are now the party leader';

					cons.players.find(c => c.id == p).socket.emit('events', {
						onGetMessages: [{
							messages: [{
								class: 'q0',
								message: msg
							}]
						}]
					});
				}, this);
			}

			this.party = null;
			this.updatePartyOnThread();
		},

		//Gets called on the player that requested the removal
		removeFromParty: function(msg) {
			if (!this.isPartyLeader) {
				this.sendMessage('you are not the party leader');
				return;
			}

			var target = cons.players.find(c => c.id == msg.data);
			if (!target)
				return;

			this.party.spliceWhere(p => p == target.id);

			this.party.forEach(function(p) {
				cons.players.find(c => c.id == p)
					.socket.emit('events', {
						onGetParty: [this.party],
						onGetMessages: [{
							messages: [{
								class: 'q0',
								message: target.name + ' has been removed from the party'
							}]
						}]
					});
			}, this);

			target.socket.emit('events', {
				onGetMessages: [{
					messages: [{
						class: 'q0',
						message: 'you have been removed from the party'
					}]
				}],
				onPartyDisband: [{}]
			});

			target.social.party = null;
			target.social.isPartyLeader = false;
			target.social.updatePartyOnThread();

			if (this.party.length == 1) {
				this.party = null
				this.isPartyLeader = null;
				this.updatePartyOnThread();

				this.sendMessage('your party has been disbanded');
			}
		},

		updatePartyOnThread: function() {
			atlas.updateObject(this.obj, {
				components: [{
					type: 'social',
					party: this.party
				}]
			});
		}
	};
});