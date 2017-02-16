define([
	'js/system/events',
	'html!ui/templates/context/template',
	'css!ui/templates/context/styles',
	'html!ui/templates/context/templateItem'
], function(
	events,
	template,
	styles,
	templateItem
) {
	return {
		tpl: template,

		postRender: function() {			
			this.onEvent('onContextMenu', this.onContextMenu.bind(this));
			this.onEvent('onHideContextMenu', this.onMouseDown.bind(this));
			this.onEvent('mouseDown', this.onMouseDown.bind(this));

			$('.ui-container').on('mouseup', this.onMouseDown.bind(this));
		},

		onContextMenu: function(config, e) {
			var container = this.el.find('.list')
				.empty();

			config.forEach(function(c, i) {
				var text = c.text ? c.text : c;

				var html = templateItem
					.replace('$TEXT$', text);

				var row = $(html)
					.appendTo(container);

				if (c.callback)
					row.on('click', this.onClick.bind(this, i, c.callback));
				else
					row.addClass('no-hover');
			}, this);

			this.el
				.css({
					left: e.clientX,
					top: e.clientY
				})
				.show();
		},

		onClick: function(index, callback) {
			this.el.hide();
			callback();
		},

		onMouseDown: function(e) {
			if ((!this.el.is(':visible')) || (e.cancel) || (e.button == 2))
				return;

			this.el.hide();
		}
	}
});