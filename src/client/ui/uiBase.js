define([
	'js/system/events'
], function(
	events
) {
	return {
		centeredX: false,
		centeredY: false,

		el: null,
		options: null,
		shown: true,

		eventCallbacks: {},

		render: function() {
			var container = '.ui-container';
			if ((this.options) && (this.options.container))
				container = this.options.container;;

			this.el = $(this.tpl)
				.appendTo(container)
				.data('ui', this);

			if (this.modal)
				this.el.addClass('modal');

			this.postRender && this.postRender();

			if (this.centered) {
				this.centeredX = true;
				this.centeredY = true;
			}

			if ((this.centeredX) || (this.centeredY))
				this.center(this.centeredX, this.centeredY);

			this.shown = this.el.is(':visible');
		},
		setOptions: function(options) {
			this.options = options;
		},
		on: function(el, event, callback) {
			if (typeof(el) == 'string')
				el = this.find(el);
			else
				el = $(el);

			el.on(event, function() {
				var args = [].slice.call(arguments, 1);
				args.splice(0, 0, event);

				callback.apply(null, args);
			});
		},
		find: function(selector) {
			return this.el.find(selector);
		},
		center: function(x, y) {
			if (x == null)
				x = true;
			if (y == null)
				y = true;

			this.centeredX = x;
			this.centeredY = y;
			
			var el = this.el;
			var pat = el.parent();

			var posX = ~~((pat.width() / 2) - (el.width() / 2)) - 10;
			var posY = ~~((pat.height() / 2) - (el.height() / 2)) - 10;

			el.css('position', 'absolute');
			if (x)
				el.css('left', posX);
			if (y)
				el.css('top', posY);
		},
		show: function() {
			if (this.modal)
				$('.modal').hide();

			this.shown = true;
			this.el.show();
		},
		hide: function() {
			if (this.beforeHide)
				this.beforeHide();
			
			this.shown = false;
			this.el.hide();
		},
		destroy: function() {
			this.offEvents();

			if (this.beforeDestroy)
				this.beforeDestroy();

			this.el.remove();
		},
		val: function(selector) {
			return this.find(selector).val();
		},

		setDisabled: function(isDisabled) {
			this.el.removeClass('disabled')

			if (isDisabled)
				this.el.addClass('disabled');
		},

		onEvent: function(event, callback) {
			var list = this.eventCallbacks[event] || (this.eventCallbacks[event] = []);
			var eventCallback = events.on(event, callback);
			list.push(eventCallback);

			return eventCallback;
		},

		offEvent: function(eventCallback) {
			for (var e in this.eventCallbacks) {
				this.eventCallbacks[e].forEach(function(c) {
					if (c == eventCallback)
						events.off(e, c);
				}, this);
			}
		},

		offEvents: function() {
			for (var e in this.eventCallbacks) {
				this.eventCallbacks[e].forEach(function(c) {
					events.off(e, c);
				}, this);
			}
		}
	};
});