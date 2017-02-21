define([

], function(

) {
	return {
		accounts: {
			admin: {
				level: 10,
				messageStyle: 'color-cyan',
				messagePrefix: '(dev) ',
				items: [{
					type: 'key',
					name: 'Key to the world',
					sprite: [12, 0],
					keyId: 'world'
				}]
			}
		},

		onBeforePlayerEnterGame: function(obj, blueprint) {
			var account = obj.account;
			var config = this.accounts[account] || {};
			if (config.items) {
				var blueprintInventory = blueprint.components.find(c => (c.type == 'inventory'));
				if (!blueprintInventory) {
					blueprint.components.push({
						type: 'inventory',
						items: []
					});

					return;
				}
				else if (!blueprintInventory.items)
					blueprintInventory.items = [];

				var items = blueprintInventory.items;
				config.items.forEach(function(item) {
					var hasItem = items.find(i => (i.name == item.name));
					if (hasItem)
						return;

					items.push(item);
				}, this);
			}
		},

		isRoleLevel: function(player, requireLevel, message) {
			var account = player.account;
			var level = this.accounts[account] ? this.accounts[account].level : 0;

			var success = (level >= requireLevel);

			if ((!success) && (message))
				this.sendMessage(player, message);

			return success;
		},

		getRoleMessageStyle: function(player) {
			var account = player.account;
			return this.accounts[account] ? this.accounts[account].messageStyle : null;
		},

		getRoleMessagePrefix: function(player) {
			var account = player.account;
			return this.accounts[account] ? this.accounts[account].messagePrefix : null;
		},

		sendMessage: function(player, msg) {
			msg = 'Only certain roles can ' + msg + ' at the moment';

			player.instance.syncer.queue('onGetMessages', {
				id: player.id,
				messages: {
					class: 'color-green',
					message: msg
				}
			}, [player.serverId]);
		}
	};
});