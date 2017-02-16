define([

], function(

) {
	return {
		buffer: {},
		dirty: false,

		init: function(msg) {
			this.objects = msg.objects;
		},

		update: function() {
			var objects = this.objects;

			var oList = objects.objects;
			var oLen = oList.length;

			//OPTIMIZE: Store a list of all players
			var pList = oList.filter(o => o.player);
			var pLen = pList.length;

			var cache = {};

			if (pLen > 0) {
				var queueFunction = this.queue.bind(this, 'onGetObject');

				for (var i = 0; i < oLen; i++) {
					var o = oList[i];
					var oId = o.id;

					if (!o.syncer)
						continue;

					var destroyed = o.destroyed;
					
					var sync = null;
					var syncSelf = null;
					if (!destroyed) {
						sync = o.syncer.get();
						syncSelf = o.syncer.get(true);
					}
					else {
						sync = {
							id: o.id,
							destroyed: true
						};

						objects.removeObject(o);

						oLen--;
						i--;
					}

					var toList = [];
					var completeList = [];
					var completeObj = null;

					var sendTo = false;
					var sendComplete = false;

					for (var j = 0; j < pLen; j++) {
						var p = pList[j];

						var hasSeen = p.player.hasSeen(oId);

						if (hasSeen) {
							if ((p.id == oId) && (syncSelf))
								queueFunction(syncSelf, [ p.serverId ]);

							if (sync) {
								toList.push(p.serverId);
								sendTo = true;
							}
						}
						else if (!destroyed) {
							var cached = null;
							if (p.id == oId) {
								var syncO = o.getSimple(true);
								syncO.self = true;
								queueFunction(syncO, [ p.serverId ]);
								p.player.see(oId);
								continue;
							}
							else {
								cached = cache[oId];
								if (!cached)
									cached = cache[oId] = o.getSimple();
							}

							completeObj = cached;
							completeList.push(p.serverId);
							sendComplete = true;

							p.player.see(oId);
						}
					}

					if (sendTo)
						queueFunction(sync, toList);
					if (sendComplete)
						queueFunction(completeObj, completeList);
				}
			}

			this.send();

			for (var i = 0; i < oLen; i++) {
				oList[i].syncer.reset();
			}
		},
		queue: function(event, obj, to) {
			//Send to all players in zone?
			if (to == null) {
				//OPTIMIZE: Store a list of all players
				var pList = this.objects.objects.filter(o => o.player);
				to = pList.map(p => p.serverId);
			}

			this.dirty = true;

			var buffer = this.buffer;
			var list = buffer[event] || (buffer[event] = []);

			list.push({
				to: to,
				obj: obj
			});
		},
		send: function() {
			if (!this.dirty)
				return;

			this.dirty = false;

			var buffer = this.buffer;

			process.send({
				method: 'events',
				data: buffer
			});

			this.buffer = {};
		}
	};
});