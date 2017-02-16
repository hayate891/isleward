define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/createCharacter/template',
	'css!ui/templates/createCharacter/styles',
	'ui/factory'
], function(
	events,
	client,
	template,
	styles,
	uiFactory
) {
	return {
		tpl: template,
		centered: true,

		classSprites: {
			warrior: [1, 1],
			wizard: [2, 0],
			thief: [6, 0],
			cleric: [4, 0]
		},
		class: 'wizard',
		costume: 0,

		prophecies: [],

		postRender: function() {
			this.getSkins();

			uiFactory.build('tooltips');

			this.find('.txtClass').on('click', this.changeClass.bind(this));
			this.find('.txtCostume').on('click', this.changeCostume.bind(this));

			this.find('.btnBack').on('click', this.back.bind(this));
			this.find('.btnCreate').on('click', this.create.bind(this));

			this.find('.prophecy')
				.on('click', this.onProphecyClick.bind(this))
				.on('mousemove', this.onProphecyHover.bind(this))
				.on('mouseleave', this.onProphecyUnhover.bind(this));
		},

		getSkins: function() {
			this.el.addClass('disabled');

			client.request({
				cpn: 'auth',
				method: 'getSkins',
				data: {
					
				},
				callback: this.onGetSkins.bind(this)
			});
		},

		onGetSkins: function(result) {
			this.el.removeClass('disabled');

			this.classSprites = result;

			this.costume = -1;

			this.changeCostume({
				target: this.find('.txtCostume')
			});
		},

		onProphecyHover: function(e) {
			var el = $(e.currentTarget);

			var pos = {
				x: e.clientX + 25,
				y: e.clientY
			};

			var text = el.attr('tooltip');

			events.emit('onShowTooltip', text, el[0], pos);
			$('.uiTooltips .tooltip').addClass('bright');
		},

		onProphecyUnhover: function(e) {
			var el = $(e.currentTarget);
			events.emit('onHideTooltip', el[0]);
		},

		onProphecyClick: function(e) {
			var el = $(e.currentTarget);
			var pName = el.attr('prophecy');

			if (el.hasClass('active')) {
				this.prophecies.spliceWhere(function(p) {
					return (p == pName);
				});
				el.removeClass('active');
			}
			else {
				this.prophecies.push(pName);
				el.addClass('active');
			}
		},

		clear: function() {
			this.prophecies = [];
			this.find('.prophecy').removeClass('active');
		},

		back: function() {
			this.clear();

			this.el.remove();

			uiFactory.build('characters', {});
		},

		create: function() {
			this.el.addClass('disabled');
			
			client.request({
				cpn: 'auth',
				method: 'createCharacter',
				data: {
					name: this.find('.txtName').val(),
					class: this.class,
					costume: this.costume,
					prophecies: this.prophecies
				},
				callback: this.onCreate.bind(this)
			});
		},
		onCreate: function(result) {
			this.el.removeClass('disabled');
			this.clear();

			if (!result) {
				this.el.remove();
				events.emit('onEnterGame');
			} else
				this.el.find('.message').html(result);
		},

		changeClass: function(e) {
			var el = $(e.target);
			var classes = Object.keys(this.classSprites);
			var nextIndex = (classes.indexOf(el.html()) + 1) % classes.length;
			this.costume = -1;

			var newClass = classes[nextIndex];

			el.html(newClass);

			this.class = newClass;

			this.changeCostume({
				target: this.find('.txtCostume')
			});
		},

		changeCostume: function(e) {
			var el = $(e.target);

			var spriteList = this.classSprites[this.class];

			this.costume = (this.costume + 1) % spriteList.length;

			el.html((this.costume + 1) + '/' + spriteList.length);

			this.setSprite();
		},

		setSprite: function() {
			var classSprite = this.classSprites[this.class];
			var costume = classSprite[this.costume].split(',');
			var spirteX = -costume[0] * 32;
			var spriteY = -costume[1] * 32;

			this.find('.sprite')
				.css('background', 'url("../../../images/charas.png") ' + spirteX + 'px ' + spriteY + 'px');
		}
	};
});