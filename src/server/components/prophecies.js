define([
	
], function(
	
) {
	return {
		type: 'prophecies',

		list: [],

	init: function(blueprint) {
		(blueprint.list || []).forEach(function(p) {
			var template = null;
			try {
				var template = require('config/prophecies/' + p);
			}
			catch (e) {
				console.log(e);
				}

				if (template == null)
					return;

				var p = extend(true, {}, template);
				p.obj = this.obj;
				p.init();

				this.list.push(p);
			}, this);

			delete blueprint.list;
		},

	hasProphecy: function(type) {
		return this.list.some(l => (l.type == type));
	},

	transfer: function() {
		var transferList = this.list;
		this.list = [];

			this.init({
				list: transferList
			});
		},

		fireEvent: function(event, args) {
			var list = this.list;
			var lLen = list.length;
			for (var i = 0; i < lLen; i++) {
				var l = list[i];
				var events = l.events;
				if (!events)
					continue;

				var callback = events[event];
				if (!callback)
					continue;

				callback.apply(l, args);
			}
		},

		simplify: function(self) {
			var e = {
				type: 'prophecies',
			};

			if ((this.list.length > 0) && (this.list[0].simplify))
				e.list = this.list.map(p => p.simplify());
			else
				e.list = this.list;

			return e;
		},
	};
});