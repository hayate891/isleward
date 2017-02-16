define([
	
], function(
	
) {
	return {
		type: 'casting',

		events: {
			beforeMove: function(targetPos) {
				var obj = this.obj;

				targetPos.x = obj.x;
				targetPos.y = obj.y;
			},

			beforeCastSpell: function(successObj) {		
				successObj.success = false;
			}
		}
	};
});