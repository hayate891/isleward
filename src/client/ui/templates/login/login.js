define([
	'js/system/events',
	'js/system/client',
	'ui/factory',
	'html!ui/templates/login/template',
	'css!ui/templates/login/styles',
	'js/rendering/renderer'
], function(
	events,
	client,
	uiFactory,
	template,
	styles,
	renderer
) {
	return {
		tpl: template,
		centered: true,
		postRender: function() {
			this.onEvent('onHandshake', this.onHandshake.bind(this));

			this.on('.btnLogin', 'click', this.onLoginClick.bind(this));
			this.on('.btnRegister', 'click', this.onRegisterClick.bind(this));

			this.find('.right .buttons .button').on('click', this.redirect.bind(this));

			this.find('input')
				.on('keyup', this.onKeyDown.bind(this))
				.eq(0).focus();

			renderer.buildTitleScreen();
		},

		redirect: function(e) {
			var location = $(e.target).attr('location');
			window.open(location, '_blank');
		},

		onKeyDown: function(e) {
			if (e.keyCode == 13)
				this.onLoginClick();
		},
		onHandshake: function() {
			this.show();
		},

		onLoginClick: function() {
			this.el.addClass('disabled');

			client.request({
				cpn: 'auth',
				method: 'login',
				data: {
					username: this.val('.txtUsername'),
					password: this.val('.txtPassword')
				},
				callback: this.onLogin.bind(this)
			});
		},
		onLogin: function(res) {
			this.el.removeClass('disabled');

			if (!res) {
				uiFactory.build('characters', {});

				this.el.remove();
			} else
				this.el.find('.message').html(res);
		},

		onRegisterClick: function() {
			this.el.addClass('disabled');

			client.request({
				cpn: 'auth',
				method: 'register',
				data: {
					username: this.val('.txtUsername'),
					password: this.val('.txtPassword')
				},
				callback: this.onLogin.bind(this)
			});
		}
	};
});