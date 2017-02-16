/*
	Qualities
		Normal
		Magic
		Rare
		Epic
		Legendary
*/

define([
	
], function(
	
) {
	return {
		qualities: [
			2000,
			350,
			80,
			17,
			1
		],

		magicFindMult: 7,

		generate: function(item, blueprint) {
			if (blueprint.quality != null) {
				item.quality = blueprint.quality;
				return;
			}

			var qualities = extend(true, [], this.qualities);

			var magicFind = (blueprint.magicFind || 0);
			if (!(magicFind instanceof Array))
				magicFind = [magicFind];
			else
				magicFind = extend(true, [], magicFind);

			var mLen = magicFind.length
			for (var i = 0; i < mLen; i++) {
				qualities[i] = Math.max(0, qualities[i] - (magicFind[i] * this.magicFindMult));
				if (qualities[i] > 0)
					break;
			}

			var max = qualities.reduce((p, n) => p + n);
			var gen = ~~(Math.random() * max);

			var total = 0;
			for (var i = 0; i < qualities.length; i++) {
				total += qualities[i];

				if (gen < total) {
					item.quality = i;
					return;
				}
			}

			item.quality = qualities.length - 1;
		}
	};
});