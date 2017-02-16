define([
	
], function(
	
) {
	return {
		type: 'chatter',

		chats: null,
		cdMax: 50,
		cd: 0,
		chance: 0.02,

		init: function(blueprint) {
			this.chats = extend(true, [], blueprint.chats);
			this.cd = ~~(Math.random() * this.cdMax);
		},

		update: function() {
			if ((this.cd == 0) && (Math.random() < this.chance)) {
				this.cd = this.cdMax;

				var pick = this.chats[~~(Math.random() * this.chats.length)];
				this.obj.syncer.set(false, 'chatter', 'msg', pick.msg);
			}
			else if (this.cd > 0)
				this.cd--;
		}
	};
});