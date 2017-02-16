define([
	
], function(
	
) {
	Array.prototype.firstIndex = function(callback, thisArg) {
		var T = thisArg;
		var O = Object(this);
		var len = O.length >>> 0;

		var k = 0;

		while (k < len) {
			var kValue;

			if (k in O) {
				kValue = O[k];

				if (callback.call(T, kValue, k, O))
					return k;
			}
			k++;
		}

		return -1;
	};

	Array.prototype.spliceWhere = function(callback, thisArg) {
		var T = thisArg;
		var O = Object(this);
		var len = O.length >>> 0;

		var k = 0;

		while (k < len) {
			var kValue;

			if (k in O) {
				kValue = O[k];

				if (callback.call(T, kValue, k, O)) {
					O.splice(k, 1);
					k--;
				}
			}
			k++;
		}
	};

	Array.prototype.spliceFirstWhere = function(callback, thisArg) {
		var T = thisArg;
		var O = Object(this);
		var len = O.length >>> 0;

		var k = 0;

		while (k < len) {
			var kValue;

			if (k in O) {
				kValue = O[k];

				if (callback.call(T, kValue, k, O)) {
					O.splice(k, 1);
					return kValue;
				}
			}
			k++;
		}
	};
	
	return {
		get2dArray: function(w, h, def) {
			def = def || 0;

			var result = [];
			for (var i = 0; i < w; i++) {
				var inner = [];
				for (var j = 0; j < h; j++) {
					if (def == 'array')
						inner.push([]);
					else
						inner.push(def);
				}

				result.push(inner);
			}

			return result;
		},
		randomKey: function(o) {
			var keys = Object.keys(o);

			var keyIndex = ~~(Math.random() * keys.length)
			var key = keys[keyIndex];

			return key;
		}
	};
});