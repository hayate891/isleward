define([

], function(

) {
	var colors = [
		'9a5a3c',
		'3fa7dd',
		'faac45',
		'a24eff',
		'ffeb38'
	];

	var chances = [
		0.01,
		0.03,
		0.055,
		0.1,
		0.16
	];

	var indices = {
		'50': 0,
		'51': 1,
		'128': 2,
		'52': 3,
		'53': 4
	};

	return {
		type: 'chest',

		ownerId: null,

		init: function(blueprint) {
			if (this.ownerId != -1) {
				if (!window.player) {
					this.hideSprite();
					return;
				}

				if (this.ownerId != window.player.serverId) {
					this.hideSprite();
					return;
				}
			}

			var index = indices[this.obj.cell];

			var color = colors[index];

			this.obj.addComponent('particles', {
				chance: chances[index],
				blueprint: {
					color: {
						start: colors[index]
					},
					alpha: {
						start: 0.75,
						end: 0.2
					},
					lifetime: {
						start: 1,
						end: 4
					},
					chance: chances[index]
				}
			});
		},

		hideSprite: function() {
			if (this.obj.sprite)
				this.obj.sprite.visible = false;
		}
	};
});