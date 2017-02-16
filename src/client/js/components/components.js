var components = [
	'keyboardMover',
	'mouseMover',
	'player',
	'pather',
	'attackAnimation',
	'moveAnimation',
	'bumpAnimation',
	'animation',
	'light',
	'projectile',
	'particles',
	'explosion',
	'spellbook',
	'inventory',
	'stats',
	'chest',
	'effects',
	'aggro',
	'quests',
	'resourceNode',
	'gatherer',
	'stash',
	'flash',
	'chatter',
	'dialogue',
	'trade',
	'prophecies',
	'reputation',
	'serverActions'
].map(function(c) {
	return 'js/components/' + c;
});

define(components, function() {
	var templates = {};

	[].forEach.call(arguments, function(t) {
		templates[t.type] = t;
	});

	return {
		getTemplate: function(type) {
			return templates[type];
		}
	};
});