define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/stash/template',
	'css!ui/templates/stash/styles',
	'html!ui/templates/inventory/templateItem'
], function(
	events,
	client,
	template,
	styles,
	tplItem
) {
	return {
		tpl: template,

		centered: true,
		hoverItem: null,

		shiftDown: false,

		items: [],

		modal: true,

		postRender: function() {
			this.onEvent('onGetStashItems', this.onGetStashItems.bind(this));
			this.onEvent('onDestroyStashItems', this.onDestroyStashItems.bind(this));
			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
			this.onEvent('onKeyUp', this.onKeyUp.bind(this));
		},

		build: function() {
			var container = this.el.find('.grid')
				.empty();

			var items = this.items;
			var iLen = items.length;

			var remainder = iLen % 8;
			var startNoPad = ~~(iLen / 8);
			if (remainder == 0)
				startNoPad--;
			startNoPad *= 8;

			for (var i = 0; i < iLen; i++) {
				var item = items[i];

				var imgX = -item.sprite[0] * 64;
				var imgY = -item.sprite[1] * 64;

				var itemEl = $(tplItem)
					.appendTo(container);

				var spritesheet = 'items';
				if (item.material)
					spritesheet = 'materials';
				else if (item.quest)
					spritesheet = 'questItems';

				itemEl
					.data('item', item)
					.on('mousemove', this.onHover.bind(this, itemEl, item))
					.on('mouseleave', this.hideTooltip.bind(this, itemEl, item))
					.find('.icon')
					.css('background', 'url(../../../images/' + spritesheet + '.png) ' + imgX + 'px ' + imgY + 'px')
					.on('contextmenu', this.showContext.bind(this, item));

				if (item.quantity)
					itemEl.find('.quantity').html(item.quantity);

				if (item.eq)
					itemEl.addClass('eq');
				if (item.isNew)
					itemEl.addClass('new');

				if (i >= startNoPad) {
					if (i == iLen - 1)
						itemEl.css('margin', '0px 0px 0px 0px');
					else
						itemEl.css('margin', '0px 8px 0px 0px');
				}
			}
		},

		showContext: function(item, e) {
			events.emit('onContextMenu', [{
				text: 'withdraw',
				callback: this.withdraw.bind(this, item)
			}], e);

			e.preventDefault;
			return false;
		},

		hideTooltip: function() {
			events.emit('onHideItemTooltip', this.hoverItem);
			this.hoverItem = null;
		},
		onHover: function(el, item, e) {
			if (item)
				this.hoverItem = item;
			else
				item = this.hoverItem;

			var ttPos = null;

			if (el) {
				el.removeClass('new');
				delete item.isNew;

				var elOffset = el.offset();
				ttPos = {
					x: ~~(elOffset.left + 74),
					y: ~~(elOffset.top + 4)
				};
			}

			var compare = null;
			if (this.shiftDown) {
				compare = window.player.inventory.items.find(function(i) {
					return ((i.eq) && (i.slot == item.slot));
				});
			}

			events.emit('onShowItemTooltip', item, ttPos, compare);
		},
		onClick: function(el, item) {
			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'equipment',
					method: 'equip',
					data: item.id
				}
			});
		},

		onGetStashItems: function(items) {
			this.items = items;

			//Sort by slot
			this.items.sort(function(a, b) {
				if (((a.material) && (b.material)) || ((a.quest) && (b.quest)) || ((a.slot != null) && (a.slot == b.slot))) {
					if (a.type == b.type) {
						if (a.name < b.name)
							return -1;
						else if (a.name == b.name)
							return 0;
						else if (a.name > b.name)
							return 1;
					} else {
						if ((a.type || '') < (b.type || ''))
							return -1;
						else if ((a.type || '') == (b.type || ''))
							return 0;
						else if ((a.type || '') > (b.type || ''))
							return 1;
					}
				} else if ((a.quest) && (!b.quest))
					return -1;
				else if ((b.quest) && (!a.quest))
					return 1;
				else if ((a.material) && (!b.material))
					return -1;
				else if (b.material && (!a.material))
					return 1;
				else if (a.slot > b.slot)
					return -1;
				else if (a.slot < b.slot)
					return 1;
				else {
					return b.id - a.id;
				}
			});

			if (this.shown)
				this.build();
		},
		onDestroyStashItems: function(itemIds) {
			itemIds.forEach(function(id) {
				var item = this.items.find(i => i.id == id);
				if (item == this.hoverItem) {
					this.hideTooltip();
				}

				this.items.spliceWhere(i => i.id == id);
			}, this);

			if (this.shown)
				this.build();
		},

		toggle: function() {
			if ((!this.shown) && (!window.player.stash.active))
				return;

			this.shown = !this.el.is(':visible');

			if (this.shown) {
				this.show();
				events.emit('onShowOverlay', this.el);
				this.build();				
			} else {
				this.hide();
				events.emit('onHideOverlay', this.el);
				events.emit('onHideContextMenu');
			}
		},

		onOpenStash: function() {
			this.build();
		},

		beforeDestroy: function() {
			events.emit('onHideOverlay', this.el);
		},

		withdraw: function(item) {
			if (!item)
				return;

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'stash',
					method: 'withdraw',
					data: item.id
				}
			});
		},

		onKeyDown: function(key) {
			if (key == ' ')
				this.toggle();
			else if (key == 'shift') {
				this.shiftDown = true;
				if (this.hoverItem)
					this.onHover();
			} else if ((key == 'esc') && (this.shown))
				this.toggle();
		},
		onKeyUp: function(key) {
			if (key == 'shift') {
				this.shiftDown = false;
				if (this.hoverItem)
					this.onHover();
			}
		}
	};
});