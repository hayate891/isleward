define([
	'js/renderer'
], function(
	renderer
) {
	return {
		type: 'chatter',

		cd: 0,
		cdMax: 150,

		init: function(blueprint) {

		},

		update: function() {
			var chatSprite = this.obj.chatSprite;
			if (!chatSprite)
				return;

			if (this.cd > 0) {
				this.cd--;
			}
			else if (this.cd == 0) {
				renderer.destroyObject({
					sprite: chatSprite
				});
				this.obj.chatSprite = null;
			}
		},

		extend: function(serverMsg) {
			var msg = serverMsg.msg + '\n\'';

			var obj = this.obj;

			if (obj.chatSprite) {
				renderer.destroyObject({
					sprite: obj.chatSprite
				});
			}

			var color = null;
			if (msg[0] == '*')
				color = 0xffeb38;

			obj.chatSprite = renderer.buildText({
				layerName: 'effects',
				text: msg,
				color: color,
				x: (obj.x * scale) + (scale / 2),
				y: (obj.y * scale) - (scale * 0.8)
			});
			obj.chatSprite.visible = true;

			this.cd = this.cdMax;
		}
	};
});