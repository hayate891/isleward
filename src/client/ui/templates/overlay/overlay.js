define([
	'js/system/events',
	'html!ui/templates/overlay/template',
	'css!ui/templates/overlay/styles'
], function(
	events,
	template,
	styles
) {
	return {
		tpl: template,

		focusEl: null,
		lastZIndex: 0,

		postRender: function() {
			events.on('onShowOverlay', this.onShowOverlay.bind(this));
			events.on('onHideOverlay', this.onHideOverlay.bind(this));
		},

		onShowOverlay: function(focusEl) {
			this.focusEl = focusEl;
			this.lastZIndex = focusEl.css('z-index');
			focusEl.css('z-index', ~~this.el.css('z-index') + 1);
			this.show();
		},

		onHideOverlay: function(focusEl) {
			if (!this.focusEl)
				return;
			
			if (focusEl[0] != this.focusEl[0])
				return;

			this.focusEl.css('z-index', this.lastZIndex);
			this.hide();
		}
	};
});