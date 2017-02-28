define([
	'config/quests/templates/questTemplate',
	'config/questsBase'
], function(
	questTemplate,
	globalQuests
) {
	return {
		instance: null,
		
		init: function(instance) {
			this.instance = instance;
		},
		obtain: function(obj, template) {
			var zoneName = template ? template.zoneName : obj.zoneName;
			var oQuests = obj.quests;
			if (oQuests.quests.filter(q => q.zoneName == zoneName).length > 0)
				return;			

			var zoneTemplate = null;
		
			try {
				zoneTemplate = require('config/maps/' + zoneName + '/quests.js');
			}
			catch (e) {
				zoneTemplate = globalQuests;
			}

			if (!zoneTemplate)
				zoneTemplate = globalQuests;

			var config = extend(true, {}, zoneTemplate);
			if (config.infini.length == 0)
				return;

			var pickQuest = null;
			if ((template) && (template.type))
				pickQuest = config.infini.find(c => c.type == template.type);
			
			if (!pickQuest)
				pickQuest = config.infini[~~(Math.random() * config.infini.length)];
			var pickType = pickQuest.type[0].toUpperCase() + pickQuest.type.substr(1);
			var questClass = require('config/quests/templates/quest' + pickType);

			var quest = extend(true, {}, pickQuest, questTemplate, questClass, template);
			if (template)
				quest.xp = template.xp;
			else
				quest.xp = Math.pow(this.instance.spawners.zone.level, 2) * 10;

			//Calculate next id
			var id = 0;
			var currentQuests = oQuests.quests;
			var cLen = currentQuests.length;
			for (var i = 0; i < cLen; i++) {
				var q = currentQuests[i];
				if (q.id >= id)
					id = q.id + 1;
			}
			quest.id = id;
			quest.obj = obj;
			quest.zoneName = zoneName;

			if (!oQuests.obtain(quest, !!template))
				this.obtain(obj, template);
		}
	};
});