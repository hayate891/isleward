define([
	'misc/fileLister'
], function(
	fileLister
) {
	return {
		init: function() {
			var modList = fileLister.getFolderList('mods');
			console.log(modList);


			modList.forEach(function(m) {
				var mod = null;
				try {
					mod = require('mods/' + m + '/index');
				}
				catch (e) {}

				if (mod)
					mod.init();
			}, this);
		}	
	};
});