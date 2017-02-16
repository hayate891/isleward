define([
	'js/system/events'
], function(
	events
) {
	return {
		type: 'quests',
		quests: [],

		init: function() {
			this.quests.forEach(function(q) {
				events.emit('onObtainQuest', q);
			});
		},

		extend: function(blueprint) {
			if (blueprint.updateQuests) {
				blueprint.updateQuests.forEach(function(q) {
					events.emit('onUpdateQuest', q);
					var index = this.quests.firstIndex(function(qq) {
						return (qq.id == q.id);
					});
					this.quests.splice(index, 1, q);
				}, this);
			}
			if (blueprint.completeQuests) {
				blueprint.completeQuests.forEach(function(q) {
					events.emit('onCompleteQuest', q);
					this.quests.spliceWhere(function(qq) {
						return (qq.id == q);
					});
				}, this);
			}
			if (blueprint.obtainQuests) {
				blueprint.obtainQuests.forEach(function(q) {
					events.emit('onObtainQuest', q);
					this.quests.push(q);
				}, this);
			}	
		}	
	};
});