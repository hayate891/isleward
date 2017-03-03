define([
	
], function(
	
) {
	return {
		config: null,
		state: -1,
		cd: 0,

		init: function() {
			this.update();
		},

		update: function() {
			if (this.cd == 0) {
				if (this.state < this.config.length - 1) {
					this.state++;
					var stateConfig = this.config[this.state];
					this.cd = stateConfig.delay;
					this.events[stateConfig.type].call(this, stateConfig);

					//Sometimes (Like when we make a mob attackable, then check if they're alive in a new phase), the next phase doesn't 
					// trigger soon enough. So if there's no delay, make sure to switch phases asap.
					if (!this.cd)
						this.end = true;
				}
				else
					this.end = true;
			}
			else
				this.cd--;
		},

		events: {
			mobTalk: function(config) {
				var mob = this.instance.objects.objects.find(o => (o.id == config.id));
				mob.addComponent('chatter');
				mob.syncer.set(false, 'chatter', 'msg', config.text);
			},
			addComponents: function(config) {
				var objects = this.instance.objects.objects;

				var components = config.components;
				if (!components.push)
					components = [ components ];
				var cLen = components.length;

				var mobs = config.mobs;
				if (!mobs.push)
					mobs = [ mobs ];
				var mLen = mobs.length;

				for (var i = 0; i < mLen; i++) {
					var mob = objects.find(o => (o.id == mobs[i]));
					for (var j = 0; j < cLen; j++) {
						var c = components[j];
						mob.addComponent(c.type, components[j]);
					}
				}
			}
		}
	};
});