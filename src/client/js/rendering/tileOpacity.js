define([

], function(

) {
	return {
		sheetHeight: 20,

		'tiles': {
			default: 0.4,
			max: 0.55,
			'5': 0.7,
			'6': 0.9,
			'23': 0.9,
			'24': 0.9,
			'25': 0.9,
			'50': 1,
			'51': 1,
			'52': 1,
			'53': 0.7,
			'54': 0.5,
			'57': 1,
			'58': 1,
			'59': 1,
			'60': 0.9,
			'61': 0.9,
			'62': 0.75,
			'76': 0.9,
			'80': 1,
			'81': 1,
			'82': 1,
			'83': 1,
			'87': 1,
			'90': 1,
			'95': 1,
			'102': 0.9,
			'152': 0.9,
			'153': 1,
			'163': 0.9
		},
		objects: {
			default: 0.9,
			'50': 1
		},
		'walls': {
			default: 0.85,
			max: 1,
			'84': 1,
			'103': 0.9,
			'107': 0.9,
			'116': 1,
			'120': 0.9,
			'132': 0.9,
			'133': 0.9,
			'134': 0.85,
			'139': 1,
			'148': 1,
			'150': 0.85,
			'156': 1,
			'157': 1,
			'158': 1,
			'159': 1,
			'160': 0.9,
			'161': 1,
			'162': 1,
			'163': 1,
			'164': 0.8,
			'165': 1,
			'166': 0.95,
			'167': 1,
			'168': 1,
			'169': 1
		},

		tilesNoFlip: [

		],
		wallsNoFlip: [
			156, 158, 162, 163, 167, 168,			//Ledges
			189										//Wall Sign
		],
		objectsNoFlip: [
			96, 101, 								//Clotheslines
			103, 110, 118, 126,						//Table Sides
			120, 122								//Wall-mounted plants
		],

		getSheetNum: function(tile) {
			if (tile < 192)
				return 0;
			else if (tile < 384)
				return 1;
			else
				return 2;
		},

		map: function(tile) {
			var sheetNum;

			if (tile < 192)
				sheetNum = 0;
			else if (tile < 384) {
				tile -= 192;
				sheetNum = 1;
			}
			else {
				tile -= 384;
				sheetNum = 2;
			}
			
			var tilesheet = [this.tiles, this.walls, this.objects][sheetNum];

			var alpha = (tilesheet[tile] || tilesheet.default);
			if (tilesheet.max != null) {
				alpha = alpha + (Math.random() * (alpha * 0.2));
				alpha = Math.min(1, alpha);
			}

			return alpha;
		},

		canFlip: function(tile) {
			var sheetNum;

			if (tile < 192)
				sheetNum = 0;
			else if (tile < 384) {
				tile -= 192;
				sheetNum = 1;
			}
			else {
				tile -= 384;
				sheetNum = 2;
			}
			
			var tilesheet = [this.tilesNoFlip, this.wallsNoFlip, this.objectsNoFlip][sheetNum];
			return (tilesheet.indexOf(tile) == -1);
		}
	};
});