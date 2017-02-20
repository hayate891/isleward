define([
	'js/system/events',
	'html!ui/templates/spells/template',
	'css!ui/templates/spells/styles',
	'html!ui/templates/spells/templateSpell',
	'html!ui/templates/spells/templateTooltip'
], function(
	events,
	template,
	styles,
	templateSpell,
	templateTooltip
) {
	return {
		tpl: template,

		spells: null,

		postRender: function() {
			this.onEvent('onGetSpells', this.onGetSpells.bind(this));
			this.onEvent('onGetSpellCooldowns', this.onGetSpellCooldowns.bind(this));
			this.onEvent('onGetStats', this.onGetStats.bind(this));

			setInterval(this.update.bind(this), 100);
		},

		onGetSpells: function(spells) {
			this.el.empty();

			this.spells = spells;

			for (var i = 0; i < spells.length; i++) {
				var icon = spells[i].icon;
				var x = -(icon[0] * 64);
				var y = -(icon[1] * 64);

				var html = templateSpell
					.replace('$HOTKEY$', (i + 1));

				var el = $(html)
					.appendTo(this.el);
				el
					.on('mouseover', this.onShowTooltip.bind(this, el, spells[i]))
					.on('mouseleave', this.onHideTooltip.bind(this, el));

				var spritesheet = spells[i].spritesheet || '../../../images/abilityIcons.png';
				el
					.find('.icon').css({
						'background': 'url("' + spritesheet + '") ' + x + 'px ' + y + 'px'
					})
					.next().html(i + 1);

				this.onGetSpellCooldowns({
					spell: i,
					cd: spells[i].cd * 350 //HACK - we don't actually know how long a tick is
				});
			}
		},

		onShowTooltip: function(el, spell) {
			var pos = el.offset();
			pos = {
				x: pos.left + 56,
				y: pos.top + el.height() + 16
			};

			var cd = ~~((spell.cdMax * 350) / 1000);

			var values = Object.keys(spell.values).filter(function(v) {
				return ((v != 'damage') && (v != 'healing'));
			}).map(function(v) {
				return v + ': ' + spell.values[v];
			}).join('<br />');

			var tooltip = templateTooltip
				.replace('$NAME$', spell.name)
				.replace('$DESCRIPTION$', spell.description)
				.replace('$MANA$', spell.manaCost)
				.replace('$CD$', cd)
				.replace('$VALUES$', values)
				.replace('$ELEMENT$', spell.element);

			if (spell.range) {
				tooltip = tooltip
					.replace('$RANGE$', spell.range);
			} else {
				tooltip = tooltip
					.replace('range', 'range hidden');
			}

			events.emit('onShowTooltip', tooltip, el[0], pos, 200, false, true, this.el.css('z-index'));
		},
		onHideTooltip: function(el) {
			events.emit('onHideTooltip', el[0]);
		},

		onGetSpellCooldowns: function(options) {
			var spell = this.spells[options.spell];
			spell.ttl = options.cd;
			spell.ttlStart = +new Date;
		},

		onGetStats: function(stats) {
			var mana = stats.mana;

			var spells = this.spells;
			if (!spells)
				return;

			for (var i = 0; i < spells.length; i++) {
				var spell = spells[i];

				var el = this.el.children('div').eq(i).find('.hotkey');
				el.removeClass('no-mana');
				if (spell.manaCost > mana)
					el.addClass('no-mana');
			}
		},

		update: function() {
			var spells = this.spells;
			if (!spells)
				return;

			var time = +new Date;

			for (var i = 0; i < spells.length; i++) {
				var spell = spells[i];

				if (!spell.ttl) {
					this.el.children('div').eq(i).find('.cooldown').css({
						width: '0%'
					});
					continue;
				}

				var elapsed = time - spell.ttlStart;
				var width = 1 - (elapsed / spell.ttl);
				if (width <= 0) {
					delete spell.ttl;
					width = 0;
				}

				width = Math.ceil((width * 100) / 4) * 4;

				this.el.children('div').eq(i).find('.cooldown').css({
					width: width + '%'
				});
			}
		}
	}
});