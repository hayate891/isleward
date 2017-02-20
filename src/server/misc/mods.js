define([
	'misc/fileLister'
], function(
	fileLister
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
					mod.folderName = 'server/mods/' + m
					mod.init();
				}
			}, this);
		}	
	};
});