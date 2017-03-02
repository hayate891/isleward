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
				nextPhase: 0
			};

			return event;
		},

		updateEvent: function(event) {
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
					instance: this.instance
				}, phaseTemplate, typeTemplate, p);
				
				event.phases.push(phase);

				phase.init();

				event.nextPhase = i + 1;

				if (!p.auto)
					break;
			}
		}
	};
});