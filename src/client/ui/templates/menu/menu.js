define([
	'js/system/events',
	'html!ui/templates/menu/template',
	'css!ui/templates/menu/styles'
], function(
	events,
	template,
	styles
) {
	return {
		tpl: template,
		postRender: function() {
			this.find('.btnSmithing').on('click', events.emit.bind(events, 'onShowSmithing'));
			this.find('.btnHelp').on('click', events.emit.bind(events, 'onShowHelp'));
			this.find('.btnInventory').on('click', events.emit.bind(events, 'onShowInventory'));
			this.find('.btnEquipment').on('click', events.emit.bind(events, 'onShowEquipment'));
			this.find('.btnOnline').on('click', events.emit.bind(events, 'onShowOnline'));
			this.find('.btnLeaderboard').on('click', events.emit.bind(events, 'onShowLeaderboard'));
			this.find('.btnReputation').on('click', events.emit.bind(events, 'onShowReputation'));
			this.find('.btnOptions').on('click', events.emit.bind(events, 'onToggleOptions'));
		}
	}
});