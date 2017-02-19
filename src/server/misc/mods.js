define([
	'mods/modList'
], function(
	modList
) {
	return {
		init: function() {
			modList.forEach(function(m) {
				var mod = require('mods/' + m + '/index');
				mod.init();
			}, this);
		}	
	};
});