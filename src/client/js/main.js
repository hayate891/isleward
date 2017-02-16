define([
	'js/system/client',
	'ui/factory',
	'js/renderer',
	'js/objects/objects',
	'js/rendering/effects',
	'js/rendering/numbers',
	'js/input',
	'js/system/events',
	'js/resources',
	'ui/templates/inventory/inventory',
	'ui/templates/equipment/equipment',
	'ui/templates/stash/stash',
	'ui/templates/hud/hud',
	'ui/templates/online/online',
	'ui/templates/quests/quests',
	'ui/templates/dialogue/dialogue',
	'ui/templates/smithing/smithing',
	'ui/templates/overlay/overlay',
	'ui/templates/tooltips/tooltips',
	'ui/templates/reputation/reputation',
	'ui/templates/death/death'
], function(
	client,
	uiFactory,
	renderer,
	objects,
	effects,
	numbers,
	input,
	events,
	resources
) {
	return {
		hasFocus: true,

		init: function() {
			events.on('onResourcesLoaded', this.start.bind(this));
		},
		start: function() {
			window.onfocus = this.onFocus.bind(this, true);
			window.onblur = this.onFocus.bind(this, false);
			$(window).on('contextmenu', function(e) {
				e.preventDefault();
				return false;
			});

			objects.init();
			client.init();
			renderer.init();
			input.init();

			numbers.init();

			uiFactory.init();
			uiFactory.build('login', 'body');

			this.update();
			this.render();
		},

		onFocus: function(hasFocus) {
			//Hack: Later we might want to make it not render when out of focus
			this.hasFocus = true;

			if (!hasFocus)
				input.resetKeys();
		},

		render: function() {
			numbers.render();

			renderer.render();

			requestAnimationFrame(this.render.bind(this));
		},
		update: function() {
			objects.update();
			renderer.update();
			uiFactory.update();

			setTimeout(this.update.bind(this), 16);
		}
	};
});