define([
	'misc/fileLister',
	'misc/events'
], function(
	fileLister,
	events
) {
	return {
		init: function() {
			var modList = fileLister.getFolderList('mods');

			modList.forEach(function(m) {
				var mod = null;
				try {
					mod = require('mods/' + m + '/index');
				}
				catch (e) {}

				if (mod) {
					mod.events = events;
					mod.folderName = 'server/mods/' + m;
					mod.relativeFolderName = 'mods/' + m;

					(mod.extraScripts || []).forEach(function(e) {
						try {
							var script = require('mods/' + m + '/' + e);
							script.folderName = mod.folderName;
							script.relativeFolderName = mod.relativeFolderName;
						}
						catch (e) {}
					}, this);

					mod.init();
				}
			}, this);
		}
	};
});