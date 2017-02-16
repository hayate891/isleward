define([
	'js/system/events',
	'html!ui/templates/buffs/template',
	'css!ui/templates/buffs/styles',
	'html!ui/templates/buffs/templateBuff'
], function(
	events,
	template,
	styles,
	templateBuff
) {
	var icons = {
		stunned: [4, 0],
		stealth: [7, 0],
		reflectDamage: [2, 1],
		holyVengeance: [4, 0]
	};

	return {
		tpl: template,

		icons: {},

		postRender: function() {			
			this.onEvent('onGetBuff', this.onGetBuff.bind(this));	
			this.onEvent('onRemoveBuff', this.onRemoveBuff.bind(this));
		},

		onGetBuff: function(buff) {
			var icon = icons[buff.type];
			if (!icon)
				return;

			var imgX = icon[0] * -32;
			var imgY = icon[1] * -32;

			var html = templateBuff;
			var el = $(html).appendTo(this.el)
				.css({
					background: 'url(../../../images/statusIcons.png) ' + imgX + 'px ' + imgY + 'px'
				});

			this.icons[buff.id] = el;
		},

		onRemoveBuff: function(buff) {
			var el = this.icons[buff.id];
			if (!el)
				return;
			
			el.remove();
			delete this.icons[buff.id];
		}
	}
});