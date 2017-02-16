define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/partyLoot/template',
	'html!ui/templates/partyLoot/templateItem',
	'html!ui/templates/partyLoot/templateResult',
	'css!ui/templates/partyLoot/styles'
], function(
	events,
	client,
	tpl,
	tplItem,
	tplResult,
	styles
) {
	return {
		tpl: tpl,

		items: [],

		shiftDown: false,
		hoverItem: null,

		postRender: function() {
			this.onEvent('onGetPartyLoot', this.onGetPartyLoot.bind(this));
			this.onEvent('onGetPartyLootResult', this.onGetPartyLootResult.bind(this));

			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
			this.onEvent('onKeyUp', this.onKeyUp.bind(this));
		},

		onKeyDown: function(key) {
			if (key == 'shift') {
				this.shiftDown = true;
				if (this.hoverItem)
					this.onHover(null, this.hoverItem);
			}
		},
		onKeyUp: function(key) {
			if (key == 'shift') {
				this.shiftDown = false;
				if (this.hoverItem)
					this.onHover(null, this.hoverItem);
			}
		},

		buildBox: function(msg, html, name) {
			var item = msg.item;

			var imgX = -item.sprite[0] * 64;
			var imgY = -item.sprite[1] * 64;

			var spritesheet = 'items';
			if (item.material)
				spritesheet = 'materials';
			else if (item.quest)
				spritesheet = 'questItems';

			html = html
				.replace('$NAME$', name)
				.replace('$QUALITY$', item.quality);

			var el = $(html)
				.appendTo(this.el)
				.data('item', msg);

			el.find('.image')
				.css('background', 'url(../../../images/' + spritesheet + '.png) ' + imgX + 'px ' + imgY + 'px')
				.on('mousemove', this.onHover.bind(this, el, item))
				.on('mouseleave', this.hideTooltip.bind(this, item))

			return el;
		},

		onHover: function(el, item) {
			this.hoverItem = item;
			var compare = window.player.inventory.items.find(function(i) {
				return ((i.slot == item.slot) && (i.eq));
			});

			if (!this.shiftDown)
				compare = null;

			var pos = null;
			if (el) {
				var parentEl = el.closest('.item, .result');
				pos = parentEl.offset();
				pos = {
					x: pos.left - 212 - 4,
					y: pos.top + parentEl.height() + 8
				};
			}

			events.emit('onShowItemTooltip', item, pos, compare, true);
		},

		hideTooltip: function(item) {
			if (item != this.hoverItem)
				return;

			events.emit('onHideItemTooltip', item);
			this.hoverItem = null;
		},

		onGetPartyLootResult: function(msg) {
			var didWin = (msg.winner == window.player.serverId);
			var winText = 'You Won';
			if (!didWin)
				winText = 'You Lost';

			var youRoll = msg.rolls.find(function(r) {
				return (r.playerServerId == window.player.serverId);
			});

			var winRoll = msg.rolls.find(function(r) {
				return (r.playerServerId == msg.winner);
			});

			//Maybe we passed?
			if (!youRoll)
				return;

			youRoll = youRoll.roll;
			winRoll = winRoll.roll;

			var html = tplResult
				.replace('$YOUROLL$', youRoll)
				.replace('$WINROLL$', winRoll);
			var el = this.buildBox(msg, html, '<div class="winText">- ' + winText + ' -</div>' + msg.item.name);
			if (didWin)
				el.addClass('winner');

			el.find('.roll.you .bar').css('width', ((youRoll / 100) * 100) + '%');
			el.find('.roll.winner .bar').css('width', ((winRoll / 100) * 100) + '%');

			var time = +new Date;

			var q = {
				el: el,
				item: msg.item,
				startTime: time,
				endTime: time + 5000
			};

			this.items.push(q);
		},

		onGetPartyLoot: function(msg) {
			var time = +new Date;

			var item = msg.item;

			var el = this.buildBox(msg, tplItem, msg.item.name);

			var q = {
				el: el,
				id: msg.id,
				item: msg.item,
				startTime: time,
				endTime: time + (msg.ttl * 1000)
			};

			this.items.push(q);

			el.find('.btnNeed').on('click', this.performAction.bind(this, q, 'need'));
			el.find('.btnGreed').on('click', this.performAction.bind(this, q, 'greed'));
			el.find('.btnPass').on('click', this.performAction.bind(this, q, 'pass'));
		},

		performAction: function(q, action) {
			client.request({
				module: 'lootRoller',
				method: 'performAction',
				data: {
					id: q.id,
					playerId: window.player.serverId,
					action: action
				}
			});

			q.el.remove();
			this.items.spliceWhere(i => i == q);
		},

		update: function() {
			var time = +new Date;

			var items = this.items;
			var iLen = items.length;
			for (var i = 0; i < iLen; i++) {
				var item = items[i];

				var remaining = item.endTime - time;
				var maxTime = item.endTime - item.startTime;

				if (item.el.find('.bottom').length > 0) {
					var barWidth = item.el.find('.bottom').width();
					var width = (remaining / maxTime) * barWidth;
					width = ~~(width / 4) * 4;
					item.el.find('.bottom .bar').css('width', width);
				}

				if (remaining <= 0) {
					item.el.remove();
					this.hideTooltip(item.item);
					items.splice(i, 1);
					i--;
					iLen--;
				}
			}
		}
	}
});