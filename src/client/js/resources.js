define([
	'js/system/events'
], function(
	events
) {
	var resources = {
		sprites: {},
		spriteNames: null,
		ready: false,
		init: function(config) {
			//Set global variables that define how big sprites and tiles are
			for (var p in config.info) {
				window[p] = config.info[p];
			}
			window.scaleMult = window.scale / window.spriteSize

			this.spriteNames = config.list;

			this.spriteNames.forEach(function(s) {
				var sSplit = s.split('|');
				var spriteLocation = s;
				var spriteName = s;
				if (sSplit.length > 1) {
					spriteLocation = sSplit[1];
					spriteName = sSplit[0];
				}

				var sprite = {
					name: spriteName,
					image: (new Image()),
					ready: false
				};

				sprite.image.src = spriteLocation.indexOf('png') > -1 ? spriteLocation : 'images/' + spriteLocation + '.png';
				sprite.image.onload = this.onSprite.bind(this, sprite);

				this.sprites[spriteName] = sprite;
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