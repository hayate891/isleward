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
		},

		toggle: function(show) {
			this.shown = !this.el.is(':visible');

			if (this.shown) {
				this.find('.itemList').hide();
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
					this.onHoverItem(this.hoverEl, this.hoverItem, this.hoverCompare);
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

			var skipSpellId = 0;

			this.find('[slot]')
				.removeData('item')
				.addClass('empty')
				.find('.icon')
					.off()
					.css('background', '')
					.on('click', this.buildSlot.bind(this));

			items
				.filter(function(item) {
					var spellId = item.spellId;
					if ((spellId != null) && (item.slot))
						skipSpellId = spellId;

					return ((item.eq) && ((item.slot) || (item.spellId != null)));
				}, this)
				.forEach(function(item) {
					var imgX = -item.sprite[0] * 64;
					var imgY = -item.sprite[1] * 64;

					var slot = item.slot;
					if (!slot) {
						var spellId = item.spellId;
						if (spellId > skipSpellId)
							spellId--;
						slot = 'rune-' + spellId;
					}

					var elSlot = this.find('[slot="' + slot + '"]');
					elSlot
						.data('item', item)
						.removeClass('empty')
						.find('.icon')
							.css('background', 'url(../../../images/items.png) ' + imgX + 'px ' + imgY + 'px')
							.off()
							.on('mousemove', this.onHoverItem.bind(this, elSlot, item, null))
							.on('mouseleave', this.onHoverItem.bind(this, null, null))
							.on('click', this.buildSlot.bind(this, elSlot));
				}, this);
		},

		buildSlot: function(el) {
			if (el.currentTarget)
				el = $(el.currentTarget).parent();

			var slot = el.attr('slot');
			var isRune = (slot.indexOf('rune') == 0);

			var container = this.find('.itemList')
				.empty()
				.show();

			this.hoverCompare = el.data('item');

			var items = this.items
				.filter(function(item) {
					if (isRune)
						return ((!item.slot) && (item.spell) && (!item.eq));
					else
						return ((item.slot == slot) && (!item.eq));
				}, this);
			items.splice(0, 0, {
				name: 'None',
				slot: this.hoverCompare ? this.hoverCompare.slot : null,
				id: this.hoverCompare ? this.hoverCompare.id : null,
				empty: true
			});
			if (this.hoverCompare)
				items.splice(1, 0, this.hoverCompare);

			items
				.forEach(function(item) {
					var sprite = item.sprite || [7, 0];

					var spriteSheet = item.empty ? 'uiIcons' : 'items';
					var imgX = -sprite[0] * 64;
					var imgY = -sprite[1] * 64;

					var el = $('<div class="slot"><div class="icon"></div></div>')
						.appendTo(container);

					el
						.find('.icon')
						.css('background', 'url(../../../images/' + spriteSheet + '.png) ' + imgX + 'px ' + imgY + 'px')
						.on('mousemove', this.onHoverItem.bind(this, el, item, null))
						.on('mouseleave', this.onHoverItem.bind(this, null, null))
						.on('click', this.equipItem.bind(this, item));

					if (item == this.hoverCompare)
						el.find('.icon').addClass('eq');
				}, this);

			if (items.length == 0)
				container.hide();
		},

		equipItem: function(item) {
			if (item == this.hoverCompare) {
				this.find('.itemList').hide();
				return;
			}

			var cpn = 'equipment';
			var method = 'equip';
			var data = item.id;

			if (item.empty)
				method = 'unequip';

			if (!item.slot) {
				cpn = 'inventory';
				method = 'learnAbility';
				data = {
					id: item.id,
					replaceId: this.hoverCompare ? this.hoverCompare.id : null
				};

				if (item.empty) {
					if (!this.hoverCompare) {
						this.find('.itemList').hide();
						return;
					}
					else
						data = this.hoverCompare.id;
				}
			}

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: cpn,
					method: method,
					data: data
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