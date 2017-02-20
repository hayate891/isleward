define([

], function(

) {
	return {
		events: {},
		queue: [],
		on: function(event, callback) {
			var list = this.events[event] || (this.events[event] = []);
			list.push(callback);

			for (var i = 0; i < this.queue.length; i++) {
				var q = this.queue[i];
				if (q.event != event)
					continue;

				this.queue.splice(i, 1);
				i--;

				q.args.splice(0, 0, event);

				this.emit.apply(this, q.args);
			}

			return callback;
		},
		off: function(event, callback) {
			var list = this.events[event] || [];
			var lLen = list.length;
			for (var i = 0; i < lLen; i++) {
				if (list[i] == callback) {
					list.splice(i, 1);
					i--;
					lLen--;
				}
			}

			if (lLen == 0)
				delete this.events[event];
		},
		emit: function(event) {
			var args = [].slice.call(arguments, 1);

			var list = this.events[event];
			if (!list) {
				this.queue.push({
					event: event,
					args: args
				});

				return;
			}

			var len = list.length
			for (var i = 0; i < len; i++) {
				var l = list[i];
				l.apply(null, args);
			}
		}
	};
});