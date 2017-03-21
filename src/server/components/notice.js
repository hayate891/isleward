define([

], function(

) {
	return {
		type: 'notice',

		msg: null,
		actions: null,

		syncer: null,

		maxLevel: 0,

		init: function(blueprint) {
			this.msg = blueprint.msg;
			this.actions = blueprint.actions || {};
			this.announce = blueprint.announce;
			this.maxLevel = blueprint.maxLevel || 0;

			this.syncer = this.obj.instance.syncer;
		},

		callAction: function(obj, actionName) {
			var action = this.actions[actionName];
			if (!action)
				return;

			if (action.targetId) {
				var target = this.obj.instance.objects.find(o => o.id == action.targetId);
				if (target) {
					var cpn = target[action.cpn];
					if ((cpn) && (cpn[action.method]))
						cpn[action.method].call(cpn, obj, action.args);
				}

				return;
			}

			var cpn = obj[action.cpn];
			if ((cpn) && (cpn[action.method]))
				cpn[action.method].apply(cpn, action.args);
		},

		collisionEnter: function(obj) {
			if (!obj.player)
				return;
			else if ((this.maxLevel) && (obj.stats.values.level > this.maxLevel))
				return;

			this.callAction(obj, 'enter');

			if (!this.msg)
				return;

			if (this.announce) {
				this.syncer.queue('onGetAnnouncement', {
					src: this.obj.id,
					msg: this.msg
				}, [obj.serverId]);

				return;
			}

			this.syncer.queue('onGetDialogue', {
				src: this.obj.id,
				msg: this.msg
			}, [obj.serverId]);
		},

		collisionExit: function(obj) {
			if (!obj.player)
				return;
			else if ((this.maxLevel) && (obj.stats.values.level > this.maxLevel))
				return;

			this.callAction(obj, 'exit');

			if (!this.msg)
				return;

			this.syncer.queue('onRemoveDialogue', {
				src: this.obj.id
			}, [obj.serverId]);
		}
	};
});