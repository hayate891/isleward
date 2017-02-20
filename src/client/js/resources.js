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
		init: function(list) {
			list.forEach(function(l) {
				this.spriteNames.push(l);
			}, this);

			this.spriteNames.forEach(function(s) {
				var sprite = {
					image: (new Image()),
					ready: false
				};
				sprite.image.src = s.indexOf('png') > -1 ? s : 'images/' + s + '.png';
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

	return resources;
});