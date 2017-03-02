define([
	'../../world/mobBuilder'
], function(
	mobBuilder
) {
	return {
		spawnRect: null,
		mob: null,

		init: function() {
			var objects = this.instance.objects;
			var spawnRect = this.spawnRect;

			if (!this.mob.push)
				this.mob = [ this.mob ];

			this.mob.forEach(function(l) {
				var amount = l.amount || 1;
				delete l.amount;

				l.walkDistance = 0;

				for (var i = 0; i < amount; i++) {
					var x = spawnRect.x + ~~(Math.random() * spawnRect.w);
					var y = spawnRect.y + ~~(Math.random() * spawnRect.h);

					var mob = objects.buildObjects([{
						x: x,
						y: y,
						sheetName: 'mobs',
						cell: l.cell,
						name: l.name
					}]);
					mobBuilder.build(mob, l);

					if (l.id) {
						var id = l.id.split('$').join(i);
						mob.id = id;
					}
				}
			});

			this.end = true;
		}	
	};
});