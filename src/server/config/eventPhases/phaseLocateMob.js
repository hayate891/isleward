define([
	
], function(
	
) {
	return {
		mobs: null,

		init: function() {
			if (!this.mobs.push)
				this.mobs = [ this.mobs ];

			var mobs = this.mobs;

			var objects = this.instance.objects.objects;
			var oLen = objects.length;
			for (var i = 0; i < oLen; i++) {
				var o = objects[i];
				var index = mobs.indexOf(o.id);
				if (index == -1)
					continue;

				mobs.splice(index, 1, o);
			}
		},

		update: function() {
			var players = this.instance.objects.objects.filter(function(o) {
				return o.player;
			});
			var pLen = players.length;

			var distance = this.distance;

			var mobs = this.mobs;
			var mLen = mobs.length;
			for (var i = 0; i < mLen; i++) {
				var m = mobs[i];

				for (var j = 0; j < pLen; j++) {
					var p = players[j];

					if ((Math.abs(p.x - m.x) <= distance) && (Math.abs(p.y - m.y) <= distance)) {
						mobs.splice(i, 1);
						mLen--;
						i--;
						break;
					}
				}
			}

			if (mobs.length == 0)
				this.end = true;
		}	
	};
});