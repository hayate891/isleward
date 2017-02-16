define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/progressBar/template',
	'html!ui/templates/progressBar/templateBar',
	'css!ui/templates/progressBar/styles'
], function(
	events,
	client,
	tpl,
	tplBar,
	styles
) {
	return {
		tpl: tpl,

		bars: [],

		postRender: function() {
			this.onEvent('onShowProgress', this.onShowProgress.bind(this));
		},

		onShowProgress: function(text, percentage) {
			var bar = this.bars.find(function(b) {
				return (b.text == text);
			});

			if (bar) {
				if (percentage >= 100) {
					bar.el.remove();
					this.bars.spliceWhere(function(b) { return (b == bar)});
				}
				else
					bar.el.find('.bar').css('width', percentage + '%');
			}
			else if (percentage < 100) {
				bar = $(tplBar).appendTo(this.el);
				bar.find('.bar').css('width', percentage + '%');
				bar.find('.text').html(text);

				this.bars.push({
					text: text,
					el: bar
				});
			}
		}
	}
});