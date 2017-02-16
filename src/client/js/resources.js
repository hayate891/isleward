define([
	'js/system/events'
], function(
	events
) {
	var resources = {
		spriteNames: [
			'charas',
			'tiles',
			'walls',
			'mobs',
			'bosses',
			'bigObjects',
			'objects',
			'characters',
			'attacks',
			'ui',
			'abilityIcons',
			'uiIcons',
			'items',
			'materials', 
			'questItems',
			'auras',
			'sprites',
			'animChar',
			'animMob',
			'animBoss'
		],
		sprites: {},
		ready: false,
		init: function() {
			this.spriteNames.forEach(function(s) {
				var sprite = {
					image: (new Image()),
					ready: false
				};
				sprite.image.src = 'images/' + s + '.png';
				sprite.image.onload = this.onSprite.bind(this, sprite);

				this.sprites[s] = sprite;
			}, this);
		},
		onSprite: function(sprite) {
			sprite.ready = true;

			var readyCount = 0;
			for (var s in this.sprites) {
				if (this.sprites[s].ready)
					readyCount++;
			}

			if (readyCount == this.spriteNames.length)
				this.onReady();
		},
		onReady: function() {
			this.ready = true;
			
			events.emit('onResourcesLoaded');
		}
	};

	resources.init();

	return resources;
});