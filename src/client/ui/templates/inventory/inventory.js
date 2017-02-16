define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/inventory/template',
	'css!ui/templates/inventory/styles',
	'html!ui/templates/inventory/templateItem',
	'html!ui/templates/inventory/templateTooltip',
	'js/input',
	'js/rendering/spriteShader'
], function(
	events,
	client,
	template,
	styles,
	tplItem,
	tplTooltip,
	input,
	spriteShader
) {
	var qualityColors = [{
		r: 252,
		g: 252,
		b: 252
	}, {
		r: 7,
		g: 170,
		b: 214
	}, {
		r: 255,
		g: 255,
		b: 0
	}, {
		r: 192,
		g: 0,
		b: 207
	}, {
		r: 255,
		g: 108,
		b: 4
	}];

	return {
		tpl: template,

		centered: true,

		items: [],

		shiftDown: false,

		dragItem: null,
		dragEl: null,
		hoverCell: null,

		modal: true,
		oldSpellsZIndex: 0,

		postRender: function() {
			this.onEvent('onGetItems', this.onGetItems.bind(this));
			this.onEvent('onDestroyItems', this.onDestroyItems.bind(this));
			this.onEvent('onShowInventory', this.toggle.bind(this));

			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
			this.onEvent('onKeyUp', this.onKeyUp.bind(this));

			this.find('.grid')
				.on('mousemove', this.onMouseMove.bind(this))
				.on('mouseleave', this.onMouseDown.bind(this, null, null, false));
		},

		build: function() {
			var container = this.el.find('.grid')
				.empty();

			var items = this.items
				.filter(function(item) {
					return !item.eq;
				});

			var iLen = Math.max(items.length, 50);

			var rendered = [];

			for (var i = 0; i < iLen; i++) {
				var item = items.find(function(item) {
					return ((item.pos != null) && (item.pos == i));
				});
				if (!item) {
					item = items.find(function(item) {
						if ((item.pos != null) && (i < item.pos) && (item.pos < iLen))
							return false;

						return (!rendered.some(function(r) {
							return (r == item);
						}));
					});
					if (item)
						rendered.push(item);
				} else
					rendered.push(item);

				if (!item) {
					var itemEl = $(tplItem)
						.appendTo(container);

					itemEl
						.on('mouseup', this.onMouseDown.bind(this, null, null, false))
						.on('mousemove', this.onHover.bind(this, itemEl, item))
						.on('mouseleave', this.hideTooltip.bind(this, itemEl, item))
						.children()
						.remove();

					continue;
				}

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
					//.on('click', this.onClick.bind(this, itemEl, item))
					.on('mousedown', this.onMouseDown.bind(this, itemEl, item, true))
					.on('mouseup', this.onMouseDown.bind(this, null, null, false))
					.on('mousemove', this.onHover.bind(this, itemEl, item))
					.on('mouseleave', this.hideTooltip.bind(this, itemEl, item))
					.find('.icon')
					.css('background', 'url(../../../images/' + spritesheet + '.png) ' + imgX + 'px ' + imgY + 'px')
					.on('contextmenu', this.showContext.bind(this, item));

				if (item.quantity)
					itemEl.find('.quantity').html(item.quantity);
				else if (item.eq)
					itemEl.find('.quantity').html('EQ');

				if (item.eq)
					itemEl.addClass('eq');
				else if (item.isNew) {
					itemEl.addClass('new');
					itemEl.find('.quantity').html('NEW');
				}
			}
		},

		onMouseDown: function(el, item, down, e) {
			if (e.button != 0)
				return;

			if (down) {
				this.dragEl = el.clone()
					.appendTo(this.find('.grid'))
					.hide()
					.on('mouseup', this.onMouseDown.bind(this, null, null, false))
					.addClass('dragging');

				this.dragItem = el;

				events.emit('onHideItemTooltip', this.hoverItem);
				this.hoverItem = null;
			} else if (this.dragItem) {
				if ((this.hoverCell) && (this.hoverCell[0] != this.dragItem[0])) {
					var placeholder = $('<div></div>')
						.insertAfter(this.dragItem);

					this.dragItem.insertBefore(this.hoverCell);
					this.hoverCell.insertBefore(placeholder);
					placeholder.remove();

					var msgs = [{
						id: this.dragItem.data('item').id,
						pos: this.dragItem.index()
					}];

					this.items.find(function(i) {
						return (i.id == this.dragItem.data('item').id)
					}, this).pos = this.dragItem.index();

					var hoverCellItem = this.hoverCell.data('item');
					if (hoverCellItem) {
						msgs.push({
							id: hoverCellItem.id,
							pos: this.hoverCell.index()
						});

						this.items.find(function(i) {
							return (i.id == hoverCellItem.id)
						}, this).pos = this.hoverCell.index();
					}

					client.request({
						cpn: 'player',
						method: 'performAction',
						data: {
							cpn: 'inventory',
							method: 'moveItem',
							data: msgs
						}
					});

					this.build();
				}

				this.dragItem = null;
				this.dragEl.remove();
				this.dragEl = null;
				this.hoverCell = null;
				this.find('.hover').removeClass('hover');
			}
		},

		onMouseMove: function(e) {
			if (!this.dragEl)
				return;

			var offset = this.find('.grid').offset();

			this.dragEl.css({
				left: e.clientX - offset.left - 40,
				top: e.clientY - offset.top - 40,
				display: 'block'
			});
		},

		showContext: function(item, e) {
			var menuItems = {
				drop: {
					text: 'drop',
					callback: this.performItemAction.bind(this, item, 'dropItem')
				},
				destroy: {
					text: 'destroy',
					callback: this.performItemAction.bind(this, item, 'destroyItem')
				},
				salvage: {
					text: 'salvage',
					callback: this.performItemAction.bind(this, item, 'salvageItem')
				},
				stash: {
					text: 'stash',
					callback: this.performItemAction.bind(this, item, 'stashItem')
				},
				learn: {
					text: 'learn',
					callback: this.performItemAction.bind(this, item, 'learnAbility')
				},
				equip: {
					text: 'equip',
					callback: this.performItemAction.bind(this, item, 'equip')
				},
				augment: {
					text: 'augment',
					callback: this.openAugmentUi.bind(this, item)
				},
				divider: '----------'
			};

			if (item.eq) {
				menuItems.learn.text = 'unlearn';
				menuItems.equip.text = 'unequip';
			}

			var config = [];

			if (item.ability)
				config.push(menuItems.learn);
			else if (item.slot) {
				config.push(menuItems.equip);
				if (!item.eq)
					config.push(menuItems.divider);

				if (!item.eq) {
					config.push(menuItems.augment);
					config.push(menuItems.divider);
				}
			}

			if ((!item.quest) && (!item.eq)) {
				if ((window.player.stash.active) && (!item.noSalvage))
					config.push(menuItems.stash);

				config.push(menuItems.drop);

				if ((!item.material) && (!item.noSalvage))
					config.push(menuItems.salvage);

				config.push(menuItems.destroy);
			}

			if (config.length > 0)
				events.emit('onContextMenu', config, e);

			e.preventDefault;
			return false;
		},

		hideTooltip: function() {
			if (this.dragEl) {
				this.hoverCell = null;
				return;
			}

			events.emit('onHideItemTooltip', this.hoverItem);
			this.hoverItem = null;
		},
		onHover: function(el, item, e) {
			if (this.dragEl) {
				this.hoverCell = el;
				this.find('.hover').removeClass('hover');
				el.addClass('hover');
				return;
			}

			if (item)
				this.hoverItem = item;
			else
				item = this.hoverItem;

			if (!item)
				return;

			var ttPos = null;

			if (el) {
				if (el.hasClass('new')) {
					el.removeClass('new');
					el.find('.quantity').html(item.quantity || '');
					delete item.isNew;
				}

				var elOffset = el.offset();
				ttPos = {
					x: ~~(e.clientX + 32),
					y: ~~(e.clientY)
				};
			}

			var compare = null;
			if (item.slot) {
				compare = this.items.find(function(i) {
					return ((i.eq) && (i.slot == item.slot));
				});
			}

			events.emit('onShowItemTooltip', item, ttPos, compare, false, this.shiftDown);
		},

		onGetItems: function(items) {
			this.items = items;

			this.items.forEach(function(item) {
				var prefix = -1;
				['quest', 'material', 'ability'].forEach(function(p, i) {
					if (item[p])
						prefix += 1 + i;
				});
				if (prefix == -1)
					prefix = 3 + item.slot + item.type;

				item.sortName = prefix + item.name + item.level + item.id;

				if ((item == this.hoverItem))
					this.onHover(null, item);
			}, this);

			this.items.sort(function(a, b) {
				if (a.sortName < b.sortName)
					return -1;
				else if (a.sortName > b.sortName)
					return 1;
				else
					return 0;
			});

			if (this.shown)
				this.build();
		},
		onDestroyItems: function(itemIds) {
			itemIds.forEach(function(id) {
				var item = this.items.find(i => i.id == id);
				if (item == this.hoverItem) {
					//this.hoverItem = null;
					this.hideTooltip();
				}

				this.items.spliceWhere(i => i.id == id);
			}, this);

			if (this.shown)
				this.build();
		},

		toggle: function(show) {
			this.shown = !this.el.is(':visible');

			if (this.shown) {
				this.show();
				this.build();
			} else {
				this.hide();
				events.emit('onHideInventory');
				events.emit('onHideContextMenu');
			}

			this.hideTooltip();
		},

		beforeDestroy: function() {
			this.el.parent().css('background-color', 'transparent');
			this.el.parent().removeClass('blocking');
		},

		beforeHide: function() {
			if (this.oldSpellsZIndex) {
				$('.uiSpells').css('z-index', this.oldSpellsZIndex);
				this.oldSpellsZIndex = null;
			}
		},

		performItemAction: function(item, action) {
			if (!item)
				return;
			else if ((action == 'equip') && ((item.material) || (item.quast) || (item.level > window.player.stats.values.level)))
				return;
			if (item.factions) {
				if (item.factions.some(function(f) {
						return f.noEquip;
					}))
					return;
			}

			var cpn = 'inventory';
			if (action == 'equip')
				cpn = 'equipment';

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: cpn,
					method: action,
					data: item.id
				}
			});
		},

		openAugmentUi: function(item) {
			events.emit('onSetSmithItem', {
				item: item
			});
		},

		onKeyDown: function(key) {
			if (key == 'i')
				this.toggle();
			else if (key == 'shift') {
				this.shiftDown = true;
				if (this.hoverItem)
					this.onHover();
			}
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