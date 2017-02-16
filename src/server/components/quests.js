define([

], function(

) {
	return {
		type: 'quests',
		quests: [],

		init: function(blueprint) {
			var quests = blueprint.quests || [];
			var qLen = quests.length;
			for (var i = 0; i < qLen; i++) {
				var q = quests[i];

				this.obj.instance.questBuilder.obtain(this.obj, q);
			}

			delete blueprint.quests;
			this.blueprint = blueprint;
		},

		transfer: function() {
			var blueprint = { quests: this.quests };
			this.quests = [];
			this.init(blueprint);
		},

		obtain: function(quest, hideMessage) {
			quest.active = (this.obj.zoneName == quest.zoneName);

			this.quests.push(quest);
			quest.init(hideMessage);
		},

		complete: function(id) {
			var quest = this.quests.find(q => q.id == id);
			if ((!quest) || (!quest.isReady))
				return;

			quest.complete();

			this.quests.spliceWhere(q => q == quest);

			this.obj.instance.questBuilder.obtain(this.obj);
		},

		/*update: function() {
			var quests = this.quests;
			var qLen = quests.length;
			var completed = false;
			for (var i = 0; i < qLen; i++) {
				var q = quests[i];
				if (q.isCompleted) {
					quests.splice(i, 1);
					q.ready();
					completed = true;
					qLen--;
					i--;
				}
			}

			if (completed)
				questBuilder.obtain(this.obj);
		},*/

		fireEvent: function(event, args) {
			var quests = this.quests;
			var qLen = quests.length;
			for (var i = 0; i < qLen; i++) {
				var q = quests[i];
				if (!q) {
					qLen--;
					continue;
				}
				else if (q.completed)
					continue;

				var events = q.events;
				if (!events)
					continue;

				var callback = events[event];
				if (!callback)
					continue;

				callback.apply(q, args);
			}
		},

		simplify: function(self) {
			if (!self)
				return;

			var result = {
				type: 'quests'
			};

			if (this.quests.length > 0) {
				if (this.quests[0].simplify)
					result.quests = this.quests.map(q => q.simplify(true));
				else
					result.quests = this.quests;
			}

			return result;
		}
	};
});