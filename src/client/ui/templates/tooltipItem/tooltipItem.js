define([
	'js/system/events',
	'css!ui/templates/tooltipItem/styles',
	'html!ui/templates/tooltipItem/template',
	'html!ui/templates/tooltipItem/templateTooltip',
	'js/misc/statTranslations'
], function(
	events,
	styles,
	template,
	tplTooltip,
	statTranslations
) {
	return {
		tpl: template,
		type: 'tooltipItem',

		tooltip: null,
		item: null,

		postRender: function() {
			this.tooltip = this.el.find('.tooltip');
			
			this.onEvent('onShowItemTooltip', this.onShowItemTooltip.bind(this));
			this.onEvent('onHideItemTooltip', this.onHideItemTooltip.bind(this));
		},

		onHideItemTooltip: function(item) {
			if (this.item != item)
				return;

			this.item = null;
			this.tooltip.hide();
		},

		onShowItemTooltip: function(item, pos, compare, bottomAlign, shiftDown) {
			this.item = item;

			var tempStats = $.extend(true, {}, item.stats);
			if ((compare) && (shiftDown)) {
				if (!item.eq) {
					var compareStats = compare.stats;
					for (var s in tempStats) {
						if (compareStats[s]) {
							var delta = tempStats[s] - compareStats[s];
							if (delta > 0)
								tempStats[s] = '+' + delta;
							else if (delta < 0)
								tempStats[s] = delta;
						}
						else
							tempStats[s] = '+' + tempStats[s];
					}
					for (var s in compareStats) {
						if (!tempStats[s]) {
							tempStats[s] = -compareStats[s];
						}
					}
				}
			}

			stats = Object.keys(tempStats)
				.map(function(s) {
					var statName = statTranslations.translate(s);
					var value = tempStats[s];

					if (['addCritChance', 'sprintChance', 'dmgPercent', 'xpIncrease'].indexOf(s) > -1)
						value += '%';
					else if ((s.indexOf('element') == 0) && (s.indexOf('Resist') == -1))
						value += '%';

					var row = value + ' ' + statName;
					var rowClass = '';

					if (compare) {
						if (row.indexOf('-') > -1)
							rowClass = 'loseStat';
						else if (row.indexOf('+') > -1)
							rowClass = 'gainStat';
					}

					row = '<div class="' + rowClass + '">' + row + '</div>';

					return row;
				}, this)
				.sort(function(a, b) {
					return (a.length - b.length);
				})
				.join('');

			var name = item.name;
			if (item.quantity)
				name += ' x' + item.quantity;

			var html = tplTooltip
				.replace('$NAME$', name)
				.replace('$QUALITY$', item.quality)
				.replace('$TYPE$', item.type)
				.replace('$SLOT$', item.slot)
				.replace('$STATS$', stats)
				.replace('$LEVEL$', item.level);
			if (item.power)
				html = html.replace('$POWER$', ' ' + (new Array(item.power + 1)).join('+'));

			if ((item.spell) && (item.spell.values)) {
				var abilityValues = '';
				for (var p in item.spell.values) {
					abilityValues += p + ': ' + item.spell.values[p] + '<br/>';
				}
				if (!item.ability)
					abilityValues = abilityValues;
				html = html.replace('$DAMAGE$', abilityValues);
			}

			this.tooltip.html(html);

			if (!item.level)
				this.tooltip.find('.level').hide();
			else
				this.tooltip.find('.level').show();

			if (item.power)
				this.tooltip.find('.power').show();

			if (item.level > window.player.stats.values.level)
				this.tooltip.find('.level').addClass('high-level');

			if ((item.material) || (item.quest) || (item.ability)) {
				this.tooltip.find('.level').hide();
				this.tooltip.find('.info').hide();

				if (item.material)
					this.tooltip.find('.material').show();
				else if (item.quest)
					this.tooltip.find('.quest').show();
			} 
			else if (item.eq) 
				this.tooltip.find('.info').hide();

			if (!item.ability) {
				this.tooltip.find('.damage').hide();
			}
			else
				this.tooltip.find('.info').hide();

			if (item.spell) {
				this.tooltip.find('.spellName')
					.html('<br />' + item.spell.name)
					.addClass('q' + item.spell.quality)
					.show();
				this.tooltip.find('.damage')	
					.show();
				if (item.ability)
					this.tooltip.find('.spellName').hide();
			}
			else
				this.tooltip.find('.spellName').hide();	

			this.tooltip.find('.worth').html(item.worth ? ('<br />value: ' + item.worth) : '');

			if (item.effects) {
				var htmlEffects = '';

				item.effects.forEach(function(e, i) {
					htmlEffects += e.text;
					if (i < item.effects.length - 1)
						htmlEffects += '<br />';
				});

				this.find('.effects')
					.html(htmlEffects)
					.show();
			}
			else
				this.find('.effects').hide();

			if (item.factions) {
				var htmlFactions = '';

				item.factions.forEach(function(f, i) {
					var htmlF = f.name + ': ' + f.tierName;
					if (f.noEquip)
						htmlF = '<font class="color-red">' + htmlF + '</font>';

					htmlFactions += htmlF;
					if (i < item.factions.length - 1)
						htmlFactions += '<br />';
				});

				this.find('.faction')
					.html(htmlFactions)
					.show();
			}
			else
				this.find('.faction').hide();

			if ((shiftDown) || (!compare))
				this.tooltip.find('.info').hide();

			this.tooltip
				.show();

			if (pos) {
				if (bottomAlign)
					pos.y -= this.tooltip.height();

				this.tooltip.css({
					left: pos.x,
					top: pos.y
				});
			}

			events.emit('onBuiltItemTooltip', this.tooltip);
		},

		showWorth: function(canAfford) {
			this.tooltip.find('.worth').show();

			if (!canAfford)
				this.tooltip.find('.worth').addClass('no-afford');
		}
	};
});