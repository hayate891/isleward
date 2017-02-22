define([
	'misc/events'
], function(
	events
) {
	return {
		resourceList: [
			'charas',
			'tiles',
			'walls',
			'mobs',
			'bosses',
			'bigObjects',
			'objects',
			'characters',
			'attacks',
			'ui',
			'abilityIcons',
			'uiIcons',
			'items',
			'materials', 
			'questItems',
			'auras',
			'sprites',
			'animChar',
			'animMob',
			'animBoss'
		],

		resourceInfo: {
			spriteSize: 8,
			scale: 40
		},

		init: function() {
			events.emit('onBeforeGetResourceList', this.resourceList);
			events.emit('onBeforeGetResourceInfo', this.resourceInfo);
		},

		getResourcesInfo: function(msg) {
			msg.callback({
				list: this.resourceList, 
				info: this.resourceInfo
			});
		}
	};
});