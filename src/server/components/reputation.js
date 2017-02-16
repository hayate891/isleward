define([
	'config/factionBase'
], function(
	factionBase
) {
	return {
		type: 'reputation',

		list: [],

		factions: {},

		init: function(blueprint) {
			var list = ((blueprint || {}).list || []);
			delete blueprint.list;

			list.forEach(function(l) {
				this.getBlueprint(l.id);

				this.list.push({
					id: l.id,
					rep: l.rep,
					tier: null
				});

				this.calculateTier(l.id);
			}, this);
		},

		getBlueprint: function(factionId) {
			if (this.factions[factionId])
				return this.factions[factionId];

			var factionBlueprint = null;
			try {
				factionBlueprint = require('config/factions/' + factionId);
			} catch (e) {}

			if (factionBlueprint == null)
				return;

			factionBlueprint = extend(true, {}, factionBase, factionBlueprint);

			this.factions[factionBlueprint.id] = factionBlueprint;

			return factionBlueprint;
		},

		getTier: function(factionId) {
			var faction = this.list.find(l => l.id == factionId);
			if (!faction)
				return 3;
			else
				return faction.tier;
		},

		canEquipItem: function(item) {
			var factions = item.factions;
			var fLen = factions.length;
			for (var i = 0; i < fLen; i++) {
				var f = factions[i];
				if (this.getTier(f.id) < f.tier)
					return false;
			}

			return true;
		},

		calculateTier: function(factionId) {
			var blueprint = this.getBlueprint(factionId);

			var faction = this.list.find(l => l.id == factionId);
			var rep = faction.rep;

			var tier = 0;
			var tiers = blueprint.tiers;
			var tLen = tiers.length;
			for (var i = 0; i < tLen; i++) {
				var t = tiers[i];
				tier = i - 1;

				if (t.rep > rep)
					break;
			}

			if (tier < 0)
				tier = 0;

			faction.tier = tier;

			return tier;
		},

		getReputation: function(factionId, gain) {
			var fullSync = (this.factions[factionId] == null);
			var blueprint = this.getBlueprint(factionId);

			var faction = this.list.find(l => l.id == factionId);
			if (!faction) {
				this.list.push({
					id: factionId,
					rep: blueprint.initialRep,
					tier: null
				});

				faction = this.list[this.list.length - 1];
			}

			faction.rep += gain;
			var oldTier = faction.tier;
			this.calculateTier(factionId);

			var action = 'gained';
			if (gain < 0)
				action = 'lost';

			this.obj.instance.syncer.queue('onGetMessages', {
				id: this.obj.id,
				messages: [{
					class: 'q1',
					message: 'you ' + action + ' ' + Math.abs(gain) + ' reputation with ' + blueprint.name,
					type: 'rep'
				}]
			}, [this.obj.serverId]);

			if (faction.tier != oldTier) {
				this.sendMessage(blueprint.tiers[faction.tier].name, blueprint.name);
				this.obj.equipment.unequipFactionGear(faction.id, faction.tier);
			}

			this.syncFaction(factionId, fullSync);
		},

		sendMessage: function(tierName, factionName) {
			this.obj.instance.syncer.queue('onGetMessages', {
				id: this.obj.id,
				messages: [{
					class: 'q4',
					message: 'you are now ' + tierName + ' with ' + factionName,
					type: 'rep'
				}]
			}, [this.obj.serverId]);
		},

		discoverFaction(factionId) {
			if (this.list.some(l => l.id == factionId))
				return;

			var fullSync = (this.factions[factionId] == null);
			var blueprint = this.getBlueprint(factionId);

			this.list.push({
				id: factionId,
				rep: blueprint.initialRep,
				tier: null
			});

			var tier = blueprint.tiers[this.calculateTier(factionId)].name.toLowerCase();

			this.obj.instance.syncer.queue('onGetMessages', {
				id: this.obj.id,
				messages: [{
					class: 'q4',
					message: 'you are now ' + tier + ' with ' + blueprint.name,
					type: 'rep'
				}]
			}, [this.obj.serverId]);

			this.syncFaction(factionId, fullSync);
		},

		save: function() {
			return {
				type: 'reputation',
				list: this.list
			};
		},

		simplify: function(self) {
			if (!self)
				return null;

			var sendList = this.list
				.map(function(l) {
					var result = {};
					var blueprint = this.getBlueprint(l.id);
					extend(true, result, l, blueprint);

					return result;
				}, this);

			return {
				type: 'reputation',
				list: sendList
			};
		},

		syncFaction: function(factionId, full) {
			var l = this.list.find(l => (l.id == factionId));
			var faction = {
				id: factionId,
				rep: l.rep
			};

			if (full) {
				var blueprint = this.getBlueprint(factionId);
				extend(true, faction, l, blueprint);
			}

			this.obj.syncer.setArray(true, 'reputation', 'modifyRep', faction);
		},

		events: {
			afterKillMob: function(mob) {
				if (!mob.mob)
					return;

				var grantRep = mob.mob.grantRep;
				if (!grantRep) {
					var deathRep = mob.mob.deathRep;
					if (deathRep)
						this.getReputation(mob.aggro.faction, deathRep);
					return;
				}

				for (var r in grantRep) {
					this.getReputation(r, grantRep[r]);
				}
			}
		}
	};
});