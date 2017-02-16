define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/equipment/template',
	'css!ui/templates/equipment/styles'
], function(
	events,
	client,
	template,
	styles
) {
	return {
		tpl: template,

		centered: true,

		modal: true,

		stats: null,
		equipment: null,

		hoverItem: null,
		hoverEl: null,
		hoverCompare: null,
		shiftDown: false,

		postRender: function() {
			this.onEvent('onGetStats', this.onGetStats.bind(this));
			this.onEvent('onGetItems', this.onGetItems.bind(this));

			this.onEvent('onShowEquipment', this.toggle.bind(this));

			this.find('.tab').on('click', this.onTabClick.bind(this));

			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
			this.onEvent('onKeyUp', this.onKeyUp.bind(this));

			this.find('.slot').on('click', this.buildSlot.bind(this));
		},

		toggle: function(show) {
			this.shown = !this.el.is(':visible');

			if (this.shown) {
				this.show();
				this.onGetStats();
				this.onGetItems();
			} else {
				this.find('.itemList').hide();
				this.hide();
			}

			this.onHoverItem(null, null, null);
		},

		onKeyDown: function(key) {
			if (key == 'j')
				this.toggle();
			else if (key == 'shift') {
				this.shiftDown = true;
				if (this.hoverItem)
					this.onHoverItem(this.hoverEl, this.hoverItem, null);
			}
		},
		onKeyUp: function(key) {
			if (key == 'shift') {
				this.shiftDown = false;
				if (this.hoverItem)
					this.onHoverItem(this.hoverEl, this.hoverItem, null);
			}
		},

		onTabClick: function(e) {
			this.find('.tab.selected').removeClass('selected');

			$(e.currentTarget).addClass('selected');

			this.onGetStats(this.stats);
		},

		onGetItems: function(items) {
			items = items || this.items;
			this.items = items;

			this.find('.slot').addClass('empty');

			items
				.filter(function(item) {
					return ((item.eq) && (item.slot));
				}, this)
				.forEach(function(item) {
					var imgX = -item.sprite[0] * 64;
					var imgY = -item.sprite[1] * 64;

					var elSlot = this.find('[slot="' + item.slot + '"]');
					elSlot
						.removeClass('empty')
						.find('.icon')
						.css('background', 'url(../../../images/items.png) ' + imgX + 'px ' + imgY + 'px')
						.on('mousemove', this.onHoverItem.bind(this, elSlot, item, null))
						.on('mouseleave', this.onHoverItem.bind(this, null, null))
						.on('click', this.buildSlot.bind(this, item.slot));
				}, this);

			items
				.filter(function(item) {
					return ((item.slot != 'twoHanded') && (item.spellId != null));
				}, this)
				.forEach(function(item) {
					var imgX = -item.sprite[0] * 64;
					var imgY = -item.sprite[1] * 64;

					var elSlot = this.find('[slot="rune-' + item.spellId + '"]');
					elSlot
						.removeClass('empty')
						.find('.icon')
						.css('background', 'url(../../../images/items.png) ' + imgX + 'px ' + imgY + 'px')
						.on('mousemove', this.onHoverItem.bind(this, elSlot, item, null))
						.on('mouseleave', this.onHoverItem.bind(this, null, null))
						.on('click', this.buildSlot.bind(this, item.slot));
				}, this);
		},

		buildSlot: function(e) {
			var slot = $(e.currentTarget).attr('slot');

			var container = this.find('.itemList')
				.empty()
				.show();

			this.hoverCompare = this.items.find(function(item) {
				return ((item.slot == slot) && (item.eq));
			});

			var items = this.items
				.filter(function(item) {
					return ((item.slot == slot) && (!item.eq));
				}, this);

			items
				.forEach(function(item) {
					var imgX = -item.sprite[0] * 64;
					var imgY = -item.sprite[1] * 64;

					var el = $('<div class="slot"><div class="icon"></div></div>')
						.appendTo(container);

					el
						.find('.icon')
						.css('background', 'url(../../../images/items.png) ' + imgX + 'px ' + imgY + 'px')
						.on('mousemove', this.onHoverItem.bind(this, el, item, null))
						.on('mouseleave', this.onHoverItem.bind(this, null, null))
						.on('click', this.equipItem.bind(this, item));
				}, this);

			if (items.length == 0)
				container.hide();
		},

		equipItem: function(item) {
			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'equipment',
					method: 'equip',
					data: item.id
				}
			});

			this.find('.itemList').hide();
		},

		onHoverItem: function(el, item, compare, e) {
			if (el) {
				this.hoverItem = item;
				this.hoverEl = el;

				var ttPos = null;
				if (e) {
					ttPos = {
						x: ~~(e.clientX + 32),
						y: ~~(e.clientY)
					};
				}

				events.emit('onShowItemTooltip', item, ttPos, this.hoverCompare, false, this.shiftDown);
			} else {
				events.emit('onHideItemTooltip', this.hoverItem);
				this.hoverItem = null;
			}
		},

		onGetStats: function(stats) {
			stats = stats || this.stats;
			this.stats = stats;

			var container = this.el.find('.stats');

			container
				.children('*:not(.tabs)')
				.remove();

			var xpRemaining = (stats.xpMax - stats.xp).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

			var newStats = {
				basic: {
					level: stats.level,
					'next level': xpRemaining + 'xp',
					gap1: '',
					gold: 0, //window.player.trade.gold,
					gap2: '',
					hp: ~~stats.hp + '/' + stats.hpMax,
					mana: ~~stats.mana + '/' + stats.manaMax,
					'hp regen': stats.regenHp,
					'mana regen': stats.regenMana + '%',
					gap3: '',
					str: stats.str,
					int: stats.int,
					dex: stats.dex
				},
				offense: {
					'crit chance': (~~(stats.critChance * 10) / 10) + '%',
					gap1: '',
					'arcane increase': stats.elementArcanePercent + '%',
					'fire increase': stats.elementFirePercent + '%',
					'frost increase': stats.elementFrostPercent + '%',
					'holy increase': stats.elementHolyPercent + '%',
					'physical increase': stats.elementPhysicalPercent + '%',
					'poison increase': stats.elementPoisonPercent + '%',
					gap2: '',
					'damage increase': stats.dmgPercent + '%'
				},
				defense: {
					armor: stats.armor,
					gap1: '',
					'arcane resist': stats.elementArcaneResist,
					'fire resist': stats.elementFireResist,
					'frost resist': stats.elementFrostResist,
					'holy resist': stats.elementHolyResist,
					'physical resist': stats.elementPhysicalResist,
					'poison resist': stats.elementPoisonResist,
					gap2: '',
					'all resist': stats.elementAllResist
				},
				misc: {
					'magic find': stats.magicFind,
					gap1: '',
					'sprint chance': (stats.sprintChance || 0) + '%',
					gap2: '',
					'xp increase': stats.xpIncrease + '%',
				}
			}[this.find('.tab.selected').html()];

			for (var s in newStats) {
				var label = s + ': ';
				var value = newStats[s];

				var isGap = false;
				if (label.indexOf('gap') == 0) {
					isGap = true;
					label = '';
					value = '';
				}

				var row = $('<div class="stat"><font class="q0">' + label + '</font><font color="#999">' + value + '</font></div>')
					.appendTo(container);

				if (s == 'gold')
					row.addClass('gold');
				else if ((s == 'level') || (s == 'next level'))
					row.addClass('blueText');

				if (isGap)
					row.addClass('empty');
			}
		}
	};
});