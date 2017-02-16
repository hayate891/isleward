define([
	'js/system/events',
	'html!ui/templates/hud/template',
	'css!ui/templates/hud/styles'
], function(
	events,
	template,
	styles
) {
	return {
		tpl: template,

		stats: null,

		postRender: function() {			
			this.onEvent('onGetStats', this.onGetStats.bind(this));
			this.onEvent('onGetPortrait', this.onGetPortrait.bind(this));
		},

		onGetStats: function(stats) {
			this.stats = stats;
			this.build();
		},

		onGetPortrait: function(portrait) {
			var x = (['warrior', 'cleric', 'wizard', 'thief'].indexOf(portrait) * -64);

			this.find('.portrait')
				.css({
					background: 'url("../../../images/portraitIcons.png") ' + x + 'px 0px',
					visibility: 'visible'
				});
		},

		build: function() {
			var stats = this.stats;

			var boxes = this.find('.statBox');

			[
				stats.hp / stats.hpMax,
				stats.mana / stats.manaMax,
				stats.xp / stats.xpMax
			].forEach(function(s, i) {
				boxes.eq(i).find('div:first-child').width(Math.max(0, Math.min(100, ~~(s * 100))) + '%');
			});

			boxes.eq(0).find('.text').html(Math.floor(stats.hp) + '/' + ~~stats.hpMax);
			boxes.eq(1).find('.text').html(Math.floor(stats.mana) + '/' + ~~stats.manaMax);
			boxes.eq(2).find('.text').html('level: ' + stats.level);
		}
	}
});