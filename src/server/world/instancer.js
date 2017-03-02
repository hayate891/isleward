define([
	'world/map',
	'world/syncer',
	'objects/objects',
	'world/spawners',
	'world/physics',
	'world/resourceSpawner',
	'config/spells/spellCallbacks',
	'config/quests/questBuilder',
	'world/randomMap',
	'world/customMap',
	'events/events'
], function(
	map,
	syncer,
	objects,
	spawners,
	physics,
	resourceSpawner,
	spellCallbacks,
	questBuilder,
	randomMap,
	customMap,
	events
) {
	return {
		instances: [],
		zoneId: -1,
		speed: 350,

		lastTime: 0,

		init: function(args) {
			this.zoneId = args.zoneId;

			spellCallbacks.init();

			map.init(args);

			if (!map.instanced) {
				var fakeInstance = {
					objects: objects,
					syncer: syncer,
					physics: physics,
					zoneId: this.zoneId,
					spawners: spawners,
					questBuilder: questBuilder,
					zone: map.zone,
					map: map
				};

				spawners.init(fakeInstance);

				map.create();
				map.clientMap.zoneId = this.zoneId;

				[resourceSpawner, syncer, objects, questBuilder, events].forEach(i => i.init(fakeInstance));

				this.addObject = this.nonInstanced.addObject.bind(this);
				this.onAddObject = this.nonInstanced.onAddObject.bind(this);
				this.updateObject = this.nonInstanced.updateObject.bind(this);
				this.queueAction = this.nonInstanced.queueAction.bind(this);
				this.performAction = this.nonInstanced.performAction.bind(this);
				this.removeObject = this.nonInstanced.removeObject.bind(this);
				this.onRemoveObject = this.nonInstanced.onRemoveObject.bind(this);

				this.tick = this.nonInstanced.tick.bind(this);
				this.tick();
			} else {
				spawners.init({
					zone: map.zone
				});

				map.create();
				map.clientMap.zoneId = this.zoneId;

				this.addObject = this.instanced.addObject.bind(this);
				this.onAddObject = this.instanced.onAddObject.bind(this);
				this.updateObject = this.instanced.updateObject.bind(this);
				this.queueAction = this.instanced.queueAction.bind(this);
				this.performAction = this.instanced.performAction.bind(this);
				this.removeObject = this.instanced.removeObject.bind(this);
				this.onRemoveObject = this.instanced.onRemoveObject.bind(this);

				if (map.mapFile.properties.isRandom)
					this.ttlGen = 0;

				this.tick = this.instanced.tick.bind(this);
				this.tick();
			}
		},

		nonInstanced: {
			tick: function() {
				objects.update();
				spawners.update();
				resourceSpawner.update();
				syncer.update();
				events.update();

				setTimeout(this.tick.bind(this), this.speed);
			},

			addObject: function(msg) {
				var obj = msg.obj;
				obj.serverId = obj.id;
				delete obj.id;

				if ((msg.keepPos) && (!physics.isValid(obj.x, obj.y))) {
					msg.keepPos = false;
				}

				if ((!msg.keepPos) || (obj.x == null)) {
					obj.x = map.spawn.x;
					obj.y = map.spawn.y;
				}

				obj.spawn = {
					x: map.spawn.x,
					y: map.spawn.y
				};

				syncer.queue('onGetMap', map.clientMap, [obj.serverId]);

				if (!msg.transfer)
					objects.addObject(obj, this.onAddObject.bind(this));
				else {
					var o = objects.transferObject(obj);
					if (o.zoneName != 'tutorial-cove')
						questBuilder.obtain(o);
				}
			},
			onAddObject: function(obj) {
				if (obj.zoneName != 'tutorial-cove')
					questBuilder.obtain(obj);
			},
			updateObject: function(msg) {
				var obj = objects.find(o => o.serverId == msg.id);
				if (!obj)
					return;

				var msgObj = msg.obj;

				var components = msgObj.components || [];
				delete msgObj.components;

				for (var p in msgObj) {
					obj[p] = msgObj[p];
				}

				var cLen = components.length;
				for (var i = 0; i < cLen; i++) {
					var c = components[i];
					var component = obj[c.type];
					for (var p in c) {
						component[p] = c[p];
					}
				}
			},

			queueAction: function(msg) {
				var obj = objects.find(o => o.serverId == msg.id);
				if (!obj)
					return;

				obj.queue(msg.action);
			},

			performAction: function(msg) {
				var obj = null;
				var targetId = msg.action.targetId;
				if (!targetId) 
					obj = objects.find(o => o.serverId == msg.id);
				else {
					obj = objects.find(o => o.id == targetId);
					if (obj) {
						var action = msg.action;
						if (!action.data)
							action.data = {};
						action.data.sourceId = msg.id;
					}
				}

				if (!obj)
					return;
				
				obj.performAction(msg.action);
			},

			removeObject: function(msg) {
				var obj = msg.obj;
				obj = objects.find(o => o.serverId == obj.id);
				if (!obj) {
					//We should probably never reach this
					return;
				}

				if (obj.auth)
					obj.auth.doSave();

				if (obj.player)
					obj.fireEvent('beforeRezone');

				obj.destroyed = true;
			},
			onRemoveObject: function(obj) {

			}
		},
		instanced: {
			tick: function() {
				if (map.mapFile.properties.isRandom) {
					if (this.ttlGen <= 0) {
						if (!map.oldMap)
							map.oldMap = map.clientMap.map;
						if (!map.oldCollisionMap)
							map.oldCollisionMap = map.collisionMap;

						spawners.reset();

						randomMap.generate({
							map: map,
							physics: physics,
							spawners: spawners
						});

						this.ttlGen = 2000;
					} else
						this.ttlGen--;
				}

				var instances = this.instances;
				var iLen = instances.length;
				for (var i = 0; i < iLen; i++) {
					var instance = instances[i];

					instance.objects.update();
					instance.spawners.update();
					instance.resourceSpawner.update();

					instance.syncer.update();

					if (instance.closeTtl != null) {
						var hasPlayers = instance.objects.objects.some(o => o.player);
						if (hasPlayers) {
							delete instance.closeTtl;
							continue;
						}

						instance.closeTtl--;
						if (instance.closeTtl <= 0) {
							instances.splice(i, 1);
							i--;
							iLen--;
						}
					} else {
						var isEmpty = !instance.objects.objects.some(o => o.player);
						if (isEmpty) {
							//Zones reset after being empty for 10 minutes
							instance.closeTtl = 2;
						}
					}
				}

				setTimeout(this.tick.bind(this), this.speed);
			},

			addObject: function(msg) {
				var obj = msg.obj;
				var instanceId = msg.instanceId;

				//Maybe a party member is in here already?
				var social = obj.components.find(c => c.type == 'social');
				if ((social) && (social.party)) {
					var party = social.party;
					var instances = this.instances;
					var iLen = instances.length;
					for (var i = 0; i < iLen; i++) {
						var instance = instances[i];

						var partyInside = instance.objects.objects.some(o => party.indexOf(o.serverId) > -1);
						if (partyInside) {
							if (instance.id != obj.instanceId)
								msg.keepPos = false;
							obj.instanceId = instance.id;
							obj.instance = instance;
							instanceId = instance.id;
							break;
						}
					}
				}

				if (msg.transfer)
					msg.keepPos = false;

				var exists = this.instances.find(i => i.id == instanceId);

				if (exists) {
					if ((msg.keepPos) && (!exists.physics.isValid(obj.x, obj.y)))
						msg.keepPos = false;
				}

				if ((!msg.keepPos) || (obj.x == null)) {
					obj.x = map.spawn.x;
					obj.y = map.spawn.y;
				}

				obj.spawn = {
					x: map.spawn.x,
					y: map.spawn.y
				};

				if (exists) {
					//Keep track of what the connection id is (sent from the server)
					obj.serverId = obj.id;
					delete obj.id;

					obj.spawn = {
						x: exists.map.spawn.x,
						y: exists.map.spawn.y
					};

					exists.syncer.queue('onGetMap', exists.map.clientMap, [obj.serverId]);

					if (!msg.transfer) {
						exists.objects.addObject(obj, this.onAddObject.bind(this, msg.keepPos));
					} else {
						var newObj = exists.objects.transferObject(obj);
						this.onAddObject(false, newObj);
					}

					process.send({
						method: 'object',
						serverId: obj.serverId,
						obj: {
							instanceId: exists.id
						}
					});
				} else
					obj = this.instanced.createInstance.call(this, obj, msg.transfer);
			},
			onAddObject: function(keepPos, obj) {
				if (!keepPos) {
					obj.x = obj.instance.map.spawn.x;
					obj.y = obj.instance.map.spawn.y;
				}

				obj.instance.spawners.scale(obj.stats.values.level);

				if (obj.zoneName != 'tutorial-cove')
					obj.instance.questBuilder.obtain(obj);
			},
			updateObject: function(msg) {
				var id = msg.id;
				var instanceId = msg.instanceId;

				var exists = this.instances.find(i => i.id == instanceId);
				if (!exists)
					return;

				var obj = exists.objects.find(o => o.serverId == id);
				if (!obj) {
					console.log('OBJECT NOT FOUND!!!!!!!!!!!!!!!!!!!!!!!!!!!');
					console.log(msg);
				}

				var msgObj = msg.obj;

				var components = msgObj.components || [];
				delete msgObj.components;

				for (var p in msgObj) {
					obj[p] = msgObj[p];
				}

				var cLen = components.length;
				for (var i = 0; i < cLen; i++) {
					var c = components[i];
					var component = obj[c.type];
					for (var p in c) {
						component[p] = c[p];
					}
				}
			},

			performAction: function(msg) {
				var id = msg.id;
				var instanceId = msg.instanceId;

				var exists = this.instances.find(i => i.id == instanceId);
				if (!exists)
					return;

				var obj = exists.objects.find(o => o.serverId == id);
				if (!obj)
					return;

				obj.performAction(msg.action);
			},

			queueAction: function(msg) {
				var id = msg.id;
				var instanceId = msg.instanceId;

				var exists = this.instances.find(i => i.id == instanceId);
				if (!exists)
					return;

				var obj = exists.objects.find(o => o.serverId == id);
				if (obj)
					obj.queue(msg.action);
			},

			removeObject: function(msg) {
				var obj = msg.obj;
				var instanceId = msg.instanceId;

				var exists = this.instances.find(i => i.id == instanceId);
				if (!exists)
					return;

				var obj = msg.obj;
				obj = exists.objects.find(o => o.serverId == obj.id);

				if (!obj)
					return;

				if (obj.auth)
					obj.auth.doSave();

				obj.destroyed = true;
			},
			onRemoveObject: function(obj) {

			},

			createInstance: function(objToAdd, transfer) {
				var instance = {
					id: objToAdd.name + '_' + (+new Date),
					objects: extend(true, {}, objects),
					spawners: extend(true, {}, spawners),
					syncer: extend(true, {}, syncer),
					physics: extend(true, {}, physics),
					resourceSpawner: extend(true, {}, resourceSpawner),
					zoneId: this.zoneId,
					zone: map.zone,
					closeTtl: null,
					questBuilder: extend(true, {}, questBuilder),
					events: extend(true, {}, events),
					map: {
						name: map.name,
						spawn: extend(true, {}, map.spawn),
						clientMap: extend(true, {}, map.clientMap)
					}
				};

				['objects', 'spawners', 'syncer', 'resourceSpawner', 'questBuilder', 'events'].forEach(i => instance[i].init(instance));

				this.instances.push(instance);

				var onDone = this.instanced.onCreateInstance.bind(this, instance, objToAdd, transfer);

				if (map.custom) {
					instance.customMap = extend(true, {}, customMap);
					instance.customMap.load(instance, objToAdd, onDone);
				}
				else
					onDone();
			},
			onCreateInstance: function(instance, objToAdd, transfer) {
				objToAdd.instance = instance;
				objToAdd.instanceId = instance.id;

				//Keep track of what the connection id is (sent from the server)
				objToAdd.serverId = objToAdd.id;
				delete objToAdd.id;

				var obj = null;

				instance.syncer.queue('onGetMap', instance.map.clientMap, [objToAdd.serverId]);

				if (!transfer)
					obj = instance.objects.addObject(objToAdd, this.onAddObject.bind(this, false));
				else {
					obj = instance.objects.transferObject(objToAdd);
					obj.x = instance.map.spawn.x;
					obj.y = instance.map.spawn.y;
					if (obj.zoneName != 'tutorial-cove')
						instance.questBuilder.obtain(obj);

					obj.instance.spawners.scale(obj.stats.values.level);
				}

				process.send({
					method: 'object',
					serverId: obj.serverId,
					obj: {
						instanceId: instance.id
					}
				});

				return obj;
			}
		},
	};
});