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
				return;
			}
		}
		k++;
	}
};

window._ = {
	create: function() {
		var result = {};

		[].slice.call(arguments).forEach(function(a) {
			$.extend(true, result, a);
		});

		return result;
	},
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
	randWeighted: function(weights) {
		var sample = [];
		weights.forEach(function(w, i) {
			for (var j = 0; j < w; j++) {
				sample.push(i);
			}
		});

		return sample[~~(Math.random() * sample.length)];
	}
};

define([
	
], function(
	
) {
	return window._;
});