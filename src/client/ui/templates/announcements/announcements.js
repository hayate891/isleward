define([
	'js/system/events',
	'html!ui/templates/announcements/template',
	'css!ui/templates/announcements/styles',
	'html!ui/templates/announcements/templateLine'
], function(
	events,
	template,
	styles,
	templateLine
) {
	return {
		tpl: template,

		message: null,
		maxTtl: 160,

		postRender: function() {
			this.onEvent('onGetAnnouncement', this.onGetAnnouncement.bind(this));
		},

		onGetAnnouncement: function(e) {
			this.clearMessage();

			var container = this.find('.list');

			var html = templateLine
				.replace('$MSG$', e.msg);

			var el = $(html)
				.appendTo(container);

			if (e.type)
				el.addClass(e.type);
			if (e.zIndex)
				el.css('z-index', e.zIndex);
			if (e.top)
				el.css('margin-top', e.top);

			this.message = {
				ttl: this.maxTtl,
				el: el
			};
		},

		update: function() {
			var message = this.message;
			if (!message)
				return;

			message.ttl--;

			if (message.ttl <= 0)
				this.clearMessage();
		},

		clearMessage: function() {
			var message = this.message;
			if (!message)
				return;

			this.message = null;
			message.el.remove();
		}
	}
});