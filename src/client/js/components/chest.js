define([

], function(

) {
	var colors = [
		'f2f5f5',
		'3fa7dd',
		'a24eff',
		'ff6942'
	];

	var chances = [
		0.02,
		0.05,
		0.1,
		0.17
	];

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

			var color = colors[this.obj.cell - 50];

			this.obj.addComponent('particles', {
				chance: chances[this.obj.cell - 50],
				blueprint: {
					color: {
						start: colors[this.obj.cell - 50]
					},
					alpha: {
						start: 0.75,
						end: 0.2
					},
					lifetime: {
						start: 1,
						end: 4
					},
					chance: chances[this.obj.cell - 50]
				}
			});
		},

		hideSprite: function() {
			if (this.obj.sprite)
				this.obj.sprite.visible = false;
		}
	};
});