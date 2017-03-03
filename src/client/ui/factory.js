define([
	'ui/uiBase',
	'js/system/events'
], function(
	uiBase,
	events
) {
	return {
		uis: [],
		root: '',
		init: function(root) {
			if (root)
				this.root = root + '/';

			events.on('onEnterGame', this.onEnterGame.bind(this));
			events.on('onKeyDown', this.onKeyDown.bind(this));
		},
		onEnterGame: function() {
			events.clearQueue();

			[
				'inventory',
				'equipment',
				'hud',
				'target',
				'menu',
				'spells',
				'messages',
				'online',
				'options', 
				'context',
				'party',
				'help',
				'dialogue',
				'buffs',
				'partyLoot',
				'tooltips',
				'tooltipInfo',
				'tooltipItem',
				'announcements',
				'quests',
				'events',
				'progressBar',
				'stash',
				'smithing',
				'talk',
				'trade',
				'overlay',
				'death',
				'leaderboard',
				'reputation'
			].forEach(function(u) {
				this.build(u);
			}, this);
		},

		build: function(type, options) {
			//Don't make doubles?
			var className = 'ui' + type[0].toUpperCase() + type.substr(1);
			var el = $('.' + className);
			if (el.length > 0)
				return;

			this.getTemplate(type, options);
			$(window).on('resize', this.onResize.bind(this));
		},
		getTemplate: function(type, options) {
			require([this.root + 'ui/templates/' + type + '/' + type], this.onGetTemplate.bind(this, options));
		},
		onGetTemplate: function(options, template) {
			var ui = _.create(uiBase, template);
			ui.setOptions(options);
			ui.render();
			ui.el.data('ui', ui);

			this.uis.push(ui);
		},
		onResize: function() {
			this.uis.forEach(function(ui) {
				if (ui.centered)
					ui.center();
				else if ((ui.centeredX) || (ui.centeredY))
					ui.center(ui.centeredX, ui.centeredY);
			}, this);
		},

		onKeyDown: function(key) {
			if (key == 'esc') {
				this.uis.forEach(function(u) {
					if (!u.modal)
						return;

					u.hide();
				});
				$('.uiOverlay').hide();
				events.emit('onHideContextMenu');
			}
		},

		update: function() {
			var uis = this.uis;
			var uLen = uis.length;
			for (var i = 0; i < uLen; i++) {
				var u = uis[i];
				if (u.update)
					u.update();
			}
		}
	};
});