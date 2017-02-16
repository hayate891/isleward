define([
	
], function(
	
) {
	return {
		type: 'gatherer',

		nodes: [],
		gathering: null,
		gatheringTtl: 0,
		gatheringTtlMax: 7,

		gather: function() {
			if (this.gathering != null)
				return;

			var nodes = this.nodes;
			if (nodes.length == 0)
				return;

			this.gathering = nodes[0];
			this.gatheringTtl = this.gatheringTtlMax;
		},

		update: function() {
			var gathering = this.gathering;

			if (!gathering)
				return;

			if (this.gatheringTtl > 0) {
				this.gatheringTtl--;

				var progress = 100 - ~~((this.gatheringTtl / this.gatheringTtlMax) * 100);
				this.obj.syncer.set(true, 'gatherer', 'progress', progress);

				return;
			}

			this.nodes.spliceWhere(n => n == gathering);

			gathering.inventory.giveItems(this.obj, true);
			gathering.destroyed = true;

			this.obj.stats.getXp(gathering.resourceNode.xp);

			this.obj.fireEvent('afterGatherResource');

			this.gathering = null;
		},

		enter: function(node) {
			process.send({
				method: 'events',
				data: {
					'onGetAnnouncement': [{
						obj: {
							msg: 'Press G to gather (' + node.name + ')'
						},
						to: [this.obj.serverId]
					}]
				}
			});

			this.nodes.spliceWhere(n => n == node);
			this.nodes.push(node);
		},

		exit: function(node) {
			this.nodes.spliceWhere(n => n == node);
		},

		events: {
			beforeMove: function() {
				if (!this.gathering)
					return;

				this.obj.syncer.set(true, 'gatherer', 'progress', 100);

				this.gathering = null;
			}
		}
	};
});