define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/smithing/template',
	'css!ui/templates/smithing/styles',
	'html!/ui/templates/smithing/templateItem'
], function(
	events,
	client,
	template,
	styles,
	templateItem
) {
	return {
		tpl: template,

		centered: true,

		modal: true,

		eventCloseInv: null,

		hoverItem: null,
		item: null,

		action: 'augment',

		postRender: function() {
			this.onEvent('onShowSmithing', this.toggle.bind(this));
			this.onEvent('onKeyDown', this.onKeyDown.bind(this));

			this.find('.item-picker').on('click', this.openInventory.bind(this));
			this.find('.actionButton').on('click', this.smith.bind(this));

			this.onEvent('onHideInventory', this.hackMethod.bind(this));
			this.onEvent('beforeInventoryClickItem', this.hackMethod.bind(this));

			this.onEvent('onSetSmithItem', this.onHideInventory.bind(this));

			this.find('.col-btn').on('click', this.clickAction.bind(this));
		},

		clickAction: function(e) {
			var el = $(e.currentTarget);
			this.find('.col-btn').removeClass('selected');

			var action = el.attr('action');
			var changed = (action != this.action);
			this.action = action;

			el.addClass('selected');

			if ((this.item) && (changed))
				this.getMaterials(this.item);
		},

		smith: function() {
			this.setDisabled(true);

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'inventory',
					method: 'enchantItem',
					data: {
						itemId: this.item.id,
						action: this.action
					}
				},
				callback: this.onSmith.bind(this, this.item)
			});
		},

		onSmith: function(item, result) {
			this.setDisabled(false);

			var msg = {
				msg: 'Item Enhancement Succeeded',
				type: 'success',
				zIndex: 9999999,
				top: 100
			};
			if (this.action == 'scour')
				msg.msg = 'Item Scouring Succeeded';
			if (!result.success) {
				msg.msg = 'Item Enhancement Failed';
				msg.type = 'failure';
			}

			result.addStatMsgs.forEach(function(a) {
				msg.msg += '<br /> ' + a;
			});

			events.emit('onGetAnnouncement', msg);

			if (result.item)
				this.item = result.item;

			this.getMaterials(this.item);
		},

		//Something needs to listen to events or they'll be queued
		hackMethod: function() {

		},

		openInventory: function() {
			this.eventCloseInv = this.onEvent('onHideInventory', this.onHideInventory.bind(this));
			this.eventClickInv = this.onEvent('beforeInventoryClickItem', this.onHideInventory.bind(this));

			events.emit('onShowInventory');
			this.el.hide();
		},

		onHideInventory: function(msg) {
			if (msg)
				msg.success = false;

			if ((!msg) || (!msg.item)) {
				this.offEvent(this.eventCloseInv);
				this.offEvent(this.eventClickInv);
				return;
			}
			else if (!msg.item.slot) {
				var msg = {
					msg: 'Incorrect Item Type',
					type: 'failure',
					zIndex: 9999999,
					top: 180
				};
				events.emit('onGetAnnouncement', msg);

				return;
			}
			else if (msg.item.eq) {
				var msg = {
					msg: 'Cannot augment equipped items',
					type: 'failure',
					zIndex: 9999999,
					top: 180
				};
				events.emit('onGetAnnouncement', msg);

				return;
			}

			this.offEvent(this.eventClickInv);

			$('.uiInventory').data('ui').toggle();

			this.el.show();
			events.emit('onShowOverlay', this.el);

			msg.success = false;

			if ((!msg) || (!msg.item) || (!msg.item.slot) || (msg.item.eq))
				return;

			this.item = msg.item;

			this.getMaterials(msg.item);
		},

		getMaterials: function(item) {
			this.setDisabled(true);

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'inventory',
					method: 'getEnchantMaterials',
					data: {
						itemId: item.id,
						action: this.action
					}
				},
				callback: this.onGetMaterials.bind(this, item)
			});
		},

		onGetMaterials: function(item, result) {
			this.find('.item').remove();
			this.drawItem(this.find('.item-picker'), item);

			this.find('.actionButton').removeClass('disabled').addClass('disabled');

			this.find('.chance').html('');

			var material = result.materials[0];
			if (material) {
				var hasMaterials = window.player.inventory.items.find(function(i) {
					return (i.name == material.name);
				});
				if (hasMaterials) {
					material.quantityText = hasMaterials.quantity + '/' + material.quantity;
					hasMaterials = hasMaterials.quantity >= material.quantity;
				}
				else {
					if (!material.quantityText)
						material.quantityText = '';
					material.quantityText += '0/' + material.quantity;
				}

				if (hasMaterials)
					this.find('.actionButton').removeClass('disabled');

				this.find('.chance').html(result.successChance + '%');

				this.drawItem(this.find('.material'), material, !hasMaterials);
			}

			this.setDisabled(false);
		},

		drawItem: function(container, item, redQuantity) {
			container.find('.icon').hide();

			var imgX = -item.sprite[0] * 64;
			var imgY = -item.sprite[1] * 64;

			var spritesheet = item.spritesheet || 'items';
			if (item.material)
				spritesheet = 'materials';
			else if (item.quest)
				spritesheet = 'questItems';

			var el = $(templateItem)
				.appendTo(container);

			el
				.data('item', item)
				.on('mousemove', this.onHover.bind(this, el, item))
				.on('mouseleave', this.hideTooltip.bind(this, el, item))
				.find('.icon')
				.css('background', 'url(../../../images/' + spritesheet + '.png) ' + imgX + 'px ' + imgY + 'px');

			if (item.quantity) {
				var quantityText = item.quantityText;
				el.find('.quantity').html(quantityText);
				if (redQuantity)
					el.find('.quantity').addClass('red');
			}
		},

		onHover: function(el, item, e) {
			if (item)
				this.hoverItem = item;
			else
				item = this.hoverItem;

			var ttPos = null;

			if (el) {
				var elOffset = el.offset();
				ttPos = {
					x: ~~(e.clientX + 32),
					y: ~~(e.clientY)
				};
			}

			events.emit('onShowItemTooltip', item, ttPos);
		},

		hideTooltip: function(el, item, e) {
			events.emit('onHideItemTooltip', this.hoverItem);
			this.hoverItem = null;
		},

		beforeHide: function() {
			this.offEvent(this.eventCloseInv);
			this.offEvent(this.eventClickInv);
		},

		toggle: function() {
			this.shown = !this.el.is(':visible');

			if (this.shown) {
				this.find('.item').remove();
				this.find('.icon').show();
				this.find('.actionButton').removeClass('disabled').addClass('disabled');
				this.find('.chance').html('');
				this.show();
				//this.build();
				events.emit('onShowOverlay', this.el);
			} else {
				this.hide();
				events.emit('onHideOverlay', this.el);
			}
		},
		onKeyDown: function(key) {
			if (key == 'm')
				this.toggle();
		}
	};
});