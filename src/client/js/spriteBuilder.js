define([
	'js/resources',
	'js/rendering/tileOpacity'
], function(
	resources,
	tileOpacity
) {
	var tileSize = 32;
	var width = 0;
	var height = 0;

	var canvas = null;
	var ctx = null;

	return {
		buildSprite: function(layers, maps, opacities) {
			width = maps[0].length;
			height = maps[0][0].length;

			if (canvas)
				canvas.remove();

			canvas = $('<canvas></canvas>')
				.appendTo('body')
				.css('display', 'none');

			canvas[0].width = width * tileSize;
			canvas[0].height = height * tileSize;

			ctx = canvas[0].getContext('2d');

			this.build(layers, maps, opacities);

			return canvas[0];
		},

		build: function(layers, maps, opacities) {
			var random = Math.random.bind(Math);

			for (var m = 0; m < maps.length; m++) {
				var map = maps[m];
				if (!map)
					continue;

				var layer = layers[m];
				var sprite = resources.sprites[layer].image;

				var opacity = opacities[m];

				for (var i = 0; i < width; i++) {
					var x = i * tileSize;
					for (var j = 0; j < height; j++) {
						var y = j * tileSize;

						var cell = map[i][j];
						if (cell == 0)
							continue;

						cell--;

						var tileY = ~~(cell / 8);
						var tileX = cell - (tileY * 8);

						var tileO = tileOpacity[layer];
						if (tileO) {
							if (tileO[cell])
								ctx.globalAlpha = tileO[cell];
							else
								ctx.globalAlpha = opacity;
						}
						else
							ctx.globalAlpha = opacity;

						if (random() > 0.5) {
							ctx.drawImage(
								sprite, 
								tileX * tileSize, 
								tileY * tileSize, 
								tileSize, 
								tileSize, 
								x, 
								y, 
								tileSize, 
								tileSize
							);
						}
						else {
							ctx.save();
							ctx.scale(-1, 1);
							ctx.drawImage(
								sprite,
								tileX * tileSize,
								tileY * tileSize,
								tileSize,
								tileSize, 
								-x,
								y, 
								-tileSize,
								tileSize
							);
							ctx.restore();
						}
					}
				}
			}
		}
	};
});