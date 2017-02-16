define([
	'../misc/fileLister',
	'child_process',
	'objects/objects',
	'config/maps/mapList'
], function(
	fileLister,
	childProcess,
	objects,
	mapList
) {
	return {
		nextId: 0,
		nextCallbackId: 0,
		threads: [],
		callbacks: [],

		init: function() {
			this.getMapFiles();
		},

		addObject: function(obj, keepPos, transfer) {
			var thread = this.getThreadFromName(obj.zoneName);

			var instanceId = obj.instanceId;
			if ((!thread) || (obj.zoneName != thread.name))
				instanceId = -1;

			if (!thread) {
				thread = this.getThreadFromName('tutorial-cove');
				obj.zoneName = thread.name;
			}

			obj.zone = thread.id;
			this.send(obj.zone, {
				method: 'addObject',
				args: {
					keepPos: keepPos,
					obj: obj.getSimple ? obj.getSimple(true) : obj,
					instanceId: instanceId,
					transfer: transfer
				}
			});
		},
		removeObject: function(obj, skipLocal) {
			if (!skipLocal)
				objects.removeObject(obj);

			var thread = this.getThreadFromName(obj.zoneName);
			if (!thread)
				return;

			obj.zone = thread.id;
			this.send(obj.zone, {
				method: 'removeObject',
				args: {
					obj: obj.getSimple(true),
					instanceId: obj.instanceId
				}
			});
		},
		updateObject: function(obj, msgObj) {
			this.send(obj.zone, {
				method: 'updateObject',
				args: {
					id: obj.id,
					instanceId: obj.instanceId,
					obj: msgObj
				}
			});
		},
		queueAction: function(obj, action) {
			this.send(obj.zone, {
				method: 'queueAction',
				args: {
					id: obj.id,
					instanceId: obj.instanceId,
					action: action	
				}
			});
		},
		performAction: function(obj, action) {
			this.send(obj.zone, {
				method: 'performAction',
				args: {
					id: obj.id,
					instanceId: obj.instanceId,
					action: action	
				}
			});
		},

		registerCallback: function(callback) {
			this.callbacks.push({
				id: this.nextCallbackId++,
				callback: callback
			});

			return this.nextCallbackId - 1;
		},
		resolveCallback: function(msg) {
			var callback = this.callbacks.spliceFirstWhere(c => c.id == msg.id);
			if (!callback)
				return;


			callback.callback(msg.result);
		},

		send: function(zone, msg) {
			var thread = this.getThreadFromId(zone);
			if (thread)
				thread.worker.send(msg);
		},

		getThreadFromId: function(id) {
			return this.threads.find(t => t.id == id);
		},
		getThreadFromName: function(name) {
			return this.threads.find(t => t.name == name);
		},

		getMapFiles: function() {
			mapList.forEach(m => this.spawnMap(m));
		},
		spawnMap: function(name) {
			var worker = childProcess.fork('./world/worker');
			var thread = {
				id: this.nextId++,
				name: name.replace('.json', ''),
				worker: worker
			};

			var onMessage = this.onMessage.bind(this, thread);
			worker.on('message', function(m) {
				onMessage(m);
			});

			this.threads.push(thread);
		},
		onMessage: function(thread, message) {
			if (message.module)
				global[message.module][message.method](message);
			else
				this.thread[message.method].call(this, thread, message);
		},
		thread: {
			onReady: function(thread) {
				thread.worker.send({
					method: 'init',
					args: { name: thread.name, zoneId: thread.id }
				});
			},
			event: function(thread, message) {
				objects.sendEvent(message);
			},
			events: function(thread, message) {
				objects.sendEvents(message);
			},
			object: function(thread, message) {
				objects.updateObject(message);
			},
			rezone: function(thread, message) {
				var obj = message.args.obj;
				obj.destroyed = false;
				obj.zoneName = message.args.newZone;
				obj.id = obj.serverId;

				var serverObj = objects.objects.find(o => o.id == obj.id);
				serverObj.zoneName = obj.zoneName;
				
				var thread = this.getThreadFromName(obj.zoneName);

				if (!thread) {
					thread = this.getThreadFromName('tutorial-cove');
					obj.zoneName = thread.name;
					serverObj.zoneName = thread.name;
				}

				serverObj.zone = thread.id;
				obj.zone = thread.id;

				serverObj.player.broadcastSelf();

				this.addObject(obj, true, true);
			}
		}
	};
});
