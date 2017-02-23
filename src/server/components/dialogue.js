define([

], function(

) {
	return {
		type: 'dialogue',

		states: {},
		sourceStates: {},

		init: function(blueprint) {
			this.states = blueprint.config;
		},

		talk: function(msg) {
			var target = msg.target;
			var targetName = (msg.targetName || '').toLowerCase();

			if ((target == null) && (!targetName))
				return false;

			if ((target != null) && (target.id == null)) {
				target = this.obj.instance.objects.objects.find(o => o.id == target);
				if (!target)
					return false;
			}
			else if (targetName != null) {
				target = this.obj.instance.objects.objects.find(o => ((o.name) && (o.name.toLowerCase() == targetName)));
				if (!target)
					return false;	
			}

			if (!target.dialogue)
				return false;

			//Auto-discover faction
			if ((target.trade) && (target.trade.faction))
				this.obj.reputation.discoverFaction(target.trade.faction.id);

			var state = target.dialogue.getState(this.obj, msg.state)
			if (!state) {
				this.obj.syncer.set(true, 'dialogue', 'state', null);
				return false;
			}

			this.obj.syncer.set(true, 'dialogue', 'state', state);
		},

		stopTalk: function() {
			this.obj.syncer.set(true, 'dialogue', 'state', null);	
		},

		getState: function(sourceObj, state) {
			state = state || 1;

			//Goto?
			if ((state + '').indexOf('.') > -1) {
				var config = this.states[(state + '').split('.')[0]];
				if (!config)
					return false;

				var goto = config.options[state].goto;
				if (goto instanceof Array) {
					var gotos = [];
					goto.forEach(function(g) {
						var rolls = (g.chance * 100) || 100;
						for (var i = 0; i < rolls; i++) {
							gotos.push(g.number);
						}
					});

					state = gotos[~~(Math.random() * gotos.length)];
				}
				else
					state = goto;
			}

			this.sourceStates[sourceObj.id] = state;

			if (!this.states) {
				console.log('NO DIALOGUE STATES?!?!??!');
				console.log('NO DIALOGUE STATES?!?!??!');
				console.log('NO DIALOGUE STATES?!?!??!');
				console.log('NO DIALOGUE STATES?!?!??!');
				console.log('NO DIALOGUE STATES?!?!??!');
				console.log('NO DIALOGUE STATES?!?!??!');
				console.log('NO DIALOGUE STATES?!?!??!');
				console.log(this.obj);				
				return null;
			}
			var stateConfig = this.states[state];
			if (!stateConfig)
				return null;

			if (stateConfig.cpn) {
				var cpn = sourceObj[stateConfig.cpn];
				cpn[stateConfig.method].apply(cpn, stateConfig.args);
				return;
			}

			var result = {
				id: this.obj.id,
				msg: null,
				from: this.obj.name,
				options: []
			};

			if (stateConfig.msg instanceof Array) {
				var msgs = [];
				stateConfig.msg.forEach(function(m, i) {
					var rolls = (m.chance * 100) || 100;
					for (var j = 0; j < rolls; j++) {
						msgs.push({
							msg: m,
							index: i
						});
					}
				});

				var pick = msgs[~~(Math.random() * msgs.length)];

				result.msg = pick.msg.msg;
				result.options = stateConfig.msg[pick.index].options;
			}
			else {
				result.msg = stateConfig.msg;
				result.options = stateConfig.options;
			}

			if (!(result.options instanceof Array)) {
				if (result.options[0] == '$')
					result.options = this.states[result.options.replace('$', '')].options;
				
				result.options = Object.keys(result.options);
			}

			result.options = result.options.map(function(o) {
				var gotoState = this.states[(o + '').split('.')[0]];
				if (!gotoState.options[o])
					return null;

				return {
					id: o,
					msg: gotoState.options[o].msg
				};
			}, this);

			result.options.push({
				msg: 'Goodbye',
				id: 999
			});

			return result;
		},

		simplify: function(self) {
			return {
				type: 'dialogue'
			};
		}
	};
});