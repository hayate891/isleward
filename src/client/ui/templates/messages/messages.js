define([
	'js/system/events',
	'html!ui/templates/messages/template',
	'css!ui/templates/messages/styles',
	'js/input',
	'js/system/client'
], function(
	events,
	template,
	styles,
	input,
	client
) {
	return {
		tpl: template,

		messages: [],
		maxTtl: 500,

		hoverFilter: false,

		postRender: function() {
			//HACK: Write a global manager
			//setInterval(this.fade.bind(this), 100);

			this.onEvent('onGetMessages', this.onGetMessages.bind(this));
			this.onEvent('onDoWhisper', this.onDoWhisper.bind(this));

			this.find('input')
				.on('keydown', this.sendChat.bind(this))
				.on('blur', this.toggle.bind(this, false, true));

			this
				.find('.filter')
					.on('mouseover', this.onFilterHover.bind(this, true))
					.on('mouseleave', this.onFilterHover.bind(this, false))
					.on('click', this.onClickFilter.bind(this));

			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
		},

		onFilterHover: function(hover) {
			this.hoverFilter = hover;
		},

		onClickFilter: function(e) {
			var el = $(e.currentTarget);
			el.toggleClass('active');

			this.find('.list').toggleClass(el.attr('filter'));

			this.find('.el.message').focus();
		},

		onKeyDown: function(key, state) {
			if (key == 'enter') {
				this.toggle(true);
			}
		},

		onDoWhisper: function(charName) {
			this.toggle(true);
			var toName = charName;
			if (charName.indexOf(' ') > -1)
				toName = "'" + toName + "'";

			this.find('input').val('@' + toName + ' ');
		},

		onGetMessages: function(e) {
			var messages = e.messages;
			if (!messages.length)
				messages = [messages];

			var container = this.find('.list');

			messages.forEach(function(m) {
				var el = $('<div class="list-message ' + m.class + '">' + m.message + '</div>')
					.appendTo(container);

				if (m.type != null)
					el.addClass(m.type);
				else
					el.addClass('info');

				this.messages.push({
					ttl: this.maxTtl,
					el: el
				});
			}, this);

			container.scrollTop(9999999);
		},

		update: function() {
			return;
			var maxTtl = this.maxTtl;

			for (var i = 0; i < this.messages.length; i++) {
				var m = this.messages[i];

				if (m.ttl > 0) {
					m.ttl--;

					var opacity = ~~(m.ttl / maxTtl * 10) / 10;
					m.el[0].style.opacity = opacity;
				}
			}
		},

		toggle: function(show, isFake) {
			if ((isFake) && (this.hoverFilter))
				return;

			input.resetKeys();

			this.el.removeClass('typing');

			var textbox = this.find('input');

			if (show) {
				this.el.addClass('typing');
				textbox.focus();
				this.find('.list').scrollTop(9999999);
			} else {
				textbox.val('');
			}
		},

		sendChat: function(e) {
			if (e.which == 27)
				this.toggle(false);

			if (e.which != 13)
				return;

			if (!this.el.hasClass('typing')) {
				this.toggle(true);
				return;
			}

			var textbox = this.find('input');
			var val = textbox.val()
				.split('<')
				.join('')
				.split('>')
				.join('');

			if (val == '')
				return;

			textbox.blur();

			client.request({
				cpn: 'social',
				method: 'chat',
				data: {
					message: val
				}
			});
		}
	}
});