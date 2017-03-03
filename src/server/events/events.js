define([
	'../config/eventPhases/phaseTemplate'
], function(
	phaseTemplate
) {
	return {
		configs: null,

		init: function(instance) {
			this.instance = instance;

			var configs = null;
			try {
				configs = require('../config/maps/' + this.instance.map.name + '/events');
			}
			catch (e) {}

			if (!configs)
				return;

			this.configs = extend(true, [], configs);
			this.configs.forEach(c => (c.ttl = 5));
		},

		update: function() {
			var configs = this.configs;
			if (!configs)
				return;

			var cLen = configs.length;
			for (var i = 0; i < cLen; i++) {
				var c = configs[i];
				if (c.event) {
					this.updateEvent(c.event);					
					continue;
				}
				else if (c.ttl > 0) {
					c.ttl--;
					continue;
				}

				c.event = this.startEvent(c);
			}
		}, 

		startEvent: function(config) {
			var event = {
				config: config,
				phases: [],
				participators: [],
				objects: [],
				nextPhase: 0
			};

			return event;
		},

		updateEvent: function(event) {
			var objects = event.objects;
			var oLen = objects.length;
			for (var i = 0; i < oLen; i++) {
				if (objects[i].destroyed) {
					objects.splice(i, 1);
					i--;
					oLen--;
				}
			}

			var currentPhases = event.phases;
			var cLen = currentPhases.length;
			var stillBusy = false;
			for (var i = 0; i < cLen; i++) {
				var phase = currentPhases[i];
				if (phase.end)
					continue
				else {
					stillBusy = true;
					phase.update();
				}
			}

			if (stillBusy)
				return;

			var config = event.config;

			var phases = config.phases;
			var pLen = phases.length;
			for (var i = event.nextPhase; i < pLen; i++) {
				var p = phases[i];

				var phaseFile = 'phase' + p.type[0].toUpperCase() + p.type.substr(1);
				var typeTemplate = require('config/eventPhases/' + phaseFile);
				var phase = extend(true, {
					instance: this.instance,
					event: event
				}, phaseTemplate, typeTemplate, p);
				
				event.phases.push(phase);

				phase.init();

				event.nextPhase = i + 1;

				if (!p.auto)
					break;
			}
		},

		getCloseEvents: function(obj) {
			var x = obj.x;
			var y = obj.y;

			var configs = this.configs;
			if (!configs)
				return;

			var cLen = configs.length;
			var result = [];
			for (var i = 0; i < cLen; i++) {
				var event = configs[i].event;
				if (!event)
					continue;
				else if (event.participators.some(p => (p == obj)))
					continue;

				var distance = event.config.distance;

				var objects = event.objects;
				var oLen = objects.length;
				for (var j = 0; j < oLen; j++) {
					var o = objects[j];

					if ((Math.abs(x - o.x) < distance) && (Math.abs(y - o.y) < distance)) {
						event.participators.push(obj);
						result.push(event);
						break;
					}
				}
			}

			return result;
		}
	};
});