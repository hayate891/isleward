define([
	'js/system/events',
	'js/system/client',
	'ui/factory',
	'html!ui/templates/characters/template',
	'html!ui/templates/characters/templateListItem',
	'css!ui/templates/characters/styles'
], function(
	events,
	client,
	uiFactory,
	template,
	templateListItem,
	styles
) {
	return {
		tpl: template,
		centered: true,
		characterInfo: {},
		selected: null,
		deleteCount: 0,

		classSprites: {
			warrior: [1, 1],
			wizard: [2, 0],
			thief: [6, 0],
			cleric: [4, 0]
		},

		postRender: function() {
			this.find('.btnPlay').on('click', this.onPlayClick.bind(this));
			this.find('.btnNew').on('click', this.onNewClick.bind(this));
			this.find('.btnDelete')
				.on('click', this.onDeleteClick.bind(this))
				.on('mouseleave', this.onDeleteReset.bind(this));

			this.getCharacters();
		},

		onPlayClick: function() {
			var char = this.selected;
			if (!char)
				return;

			this.el.addClass('disabled');

			client.request({
				cpn: 'auth',
				method: 'play',
				data: {
					name: this.selected
				},
				callback: this.onPlay.bind(this)
			});
		},
		onPlay: function() {
			this.el.removeClass('disabled');
			this.el.remove();
			events.emit('onEnterGame');
		},

		onNewClick: function() {
			uiFactory.build('createCharacter', {});
			this.el.remove();
		},

		getCharacters: function() {
			this.el.addClass('disabled');

			client.request({
				cpn: 'auth',
				method: 'getCharacterList',
				callback: this.onGetCharacters.bind(this)
			});
		},
		onGetCharacters: function(characters) {
			this.find('.sprite').css('background', '');
			this.find('.info div').html('');

			this.el.removeClass('disabled');

			var list = this.find('.left')
				.empty();

			characters
				.sort(function(a, b) {
					return (b.level - a.level);
				})
				.forEach(function(c, i) {
					var name = c.name;
					if (c.level != null)
						name += '<font class="q2"> (' + c.level + ')</font>'

					var html = templateListItem
						.replace('$NAME$', name);

					var li = $(html)
						.appendTo(list);

					li.on('click', this.onCharacterClick.bind(this, c.name));

					if (i == 0)
						li.click();
				}, this);
		},
		onCharacterClick: function(name, e) {
			this.el.addClass('disabled');

			var el = $(e.target);
			el.parent().find('.selected').removeClass('selected');
			el.addClass('selected');

			var charInfo = this.characterInfo[name];
			if (charInfo) {
				this.onGetCharacter(name, charInfo);

				return;
			}

			client.request({
				cpn: 'auth',
				method: 'getCharacter',
				data: {
					name: name
				},
				callback: this.onGetCharacter.bind(this, name)
			});
		},
		onGetCharacter: function(name, result) {
			this.find('.button').removeClass('disabled');

			var spriteY = ~~(result.cell / 8);
			var spirteX = result.cell - (spriteY * 8);

			spirteX = -(spirteX * 32);
			spriteY = -(spriteY * 32);

			var spritesheet = result.previewSpritesheet || '../../../images/charas.png';

			this.find('.sprite')
				.css('background', 'url("' + spritesheet + '") ' + spirteX + 'px ' + spriteY + 'px')
				.show();

			this.find('.name').html(name);
			var stats = result.components.find(function(c) {
				return (c.type == 'stats');
			});
			if (stats) {
				this.find('.class').html(
					'Lvl ' + stats.values.level +
					' ' +
					result.class[0].toUpperCase() + result.class.substr(1)
				);
			}
			else {
				this.find('.class').html('');
			}

			this.el.removeClass('disabled');

			this.characterInfo[name] = result;
			this.selected = name;

			var prophecies = result.components.find(function(c) {
				return (c.type == 'prophecies');
			});

			if ((prophecies) && (prophecies.list.indexOf('hardcore') > -1))
				this.find('.name').html(name + ' (hc)');

			this.find('.btnPlay').removeClass('disabled');

			if (result.permadead) {
				this.find('.name').html(name + ' (hc - rip)');
				this.find('.btnPlay').addClass('disabled');
			}
		},

		setMessage: function(msg) {
			this.find('.message').html(msg);
		},

		onDeleteClick: function() {
			if (!this.selected)
				return;

			if (this.deleteCount < 3) {
				this.deleteCount++;

				this.setMessage('click delete ' + (4 - this.deleteCount) +  ' more time' + ((this.deleteCount == 3) ? '' : 's') + ' to confirm');

				this.find('.btnDelete')
					.removeClass('deleting')
					.addClass('deleting')
					.html('delete (' + (4 - this.deleteCount) + ')')

				return;
			}
			this.onDeleteReset();

			this.el.addClass('disabled');

			client.request({
				cpn: 'auth',
				method: 'deleteCharacter',
				data: {
					name: this.selected
				},
				callback: this.onGetCharacters.bind(this)
			});
		},

		onDeleteReset: function() {
			this.setMessage('');
			this.deleteCount = 0;
			this.find('.btnDelete')
				.removeClass('deleting')
				.html('delete');
		}
	};
});