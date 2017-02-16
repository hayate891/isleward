define([
	'js/resources'
], function(
	resources
) {
	var canvas = $('<canvas></canvas>').appendTo('body').hide();

	return {
		outline: function(imgName, offsetX, offsetY, imgW, imgH, ur, ug, ub, ua) {
			var img = resources.sprites[imgName].image;

			canvas[0].width = imgW;
			canvas[0].height = imgH;

			var ctx = canvas[0].getContext('2d');
			ctx.drawImage(img, offsetX, offsetY, imgW, imgH, 2, 2, imgW, imgH);

			var imgData = ctx.getImageData(0, 0, imgW, imgH);
			var pixels = imgData.data;

			var secondData = ctx.getImageData(0, 0, imgW, imgH);
			var secondPixels = secondData.data;

			var newData = ctx.createImageData(imgW * 4, imgH * 4);
			var newPixels = newData.data;

			var fillPixels = function(x, y, r, g, b, a) {
				var index = ((y * imgW * 4) + x) * 4;

				for (var i = 0; i < 4; i++) {
					for (var j = 0; j < 4; j++) {
						var newIndex = index + (i * 4) + (j * (imgW * 4 * 4));
						newPixels[newIndex] = r;
						newPixels[newIndex + 1] = g;
						newPixels[newIndex + 2] = b;
						newPixels[newIndex + 3] = a;
					}
				}
			}

			for (var i = 0; i < imgW; i++) {
				for (var j = 0; j < imgW; j++) {
					var index = ((j * imgW) + i) * 4;

					var transparent = (pixels[index + 3] == 0);
					if (transparent) {
						var touchPixel = false;
						if (i > 0)
							touchPixel = (pixels[index - 1] > 0);
						if ((!touchPixel) && (j > 0))
							touchPixel = (pixels[index - (imgW * 4) + 3] > 0);
						if ((!touchPixel) && (i < imgW - 1))
							touchPixel = (pixels[index + 7] > 0);
						if ((!touchPixel) && (j < imgH - 1))
							touchPixel = (pixels[index + (imgW * 4) + 3] > 0);

						if (touchPixel) {
							secondPixels[index] = 0;
							secondPixels[index + 1] = 0;
							secondPixels[index + 2] = 0;
							secondPixels[index + 3] = 255;
						}
					}
				}
			}

			for (var i = 0; i < imgW; i++) {
				for (var j = 0; j < imgW; j++) {
					var index = ((j * imgW) + i) * 4;

					var transparent = (secondPixels[index + 3] == 0);
					if (transparent) {
						var touchPixel = false;
						if (i > 0)
							touchPixel = (secondPixels[index - 1] > 0)
						if ((!touchPixel) && (j > 0))
							touchPixel = (secondPixels[index - (imgW * 4) + 3] > 0)
						if ((!touchPixel) && (i < imgW - 1))
							touchPixel = (secondPixels[index + 7] > 0)
						if ((!touchPixel) && (j < imgH - 1))
							touchPixel = (secondPixels[index + (imgW * 4) + 3] > 0)

						if (touchPixel)
							fillPixels(i * 4, j * 4, ur, ug, ub, ua);

						continue;
					}

					var r = secondPixels[index];
					var g = secondPixels[index + 1];
					var b = secondPixels[index + 2];
					var a = secondPixels[index + 3];
					if ((r + g + b == 0) && (a == 255)) {
						a = 0;
					}

					fillPixels(i * 4, j * 4, r, g, b, a);
				}
			}

			canvas[0].width = imgW * 4;
			canvas[0].height = imgH * 4;

			ctx.putImageData(newData, 0, 0);

			var url = canvas[0].toDataURL();

			return url;
		}	
	};
});
