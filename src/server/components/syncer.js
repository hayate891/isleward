define([

], function(

) {
	return {
		type: 'syncer',
		o: { components: [] },
		oSelf: { components: [] },
		reset: function() {
			this.o = {
				components: []
			};

			this.oSelf = {
				components: []
			};
		},
		get: function(self) {
			var o = this.o;
			if (self)
				o = this.oSelf;

			var keys = Object.keys(o);
			if (o.components.length == 0) {
				if (keys.length == 1) 
					return null;
				else
					delete o.components;
			}

			o.id = this.obj.id;

			return o;
		},
		set: function(self, cpnType, property, value) {
			var o = this.o;
			if (self)
				o = this.oSelf;

			if (cpnType) {
				var cpn = o.components.find(c => (c.type == cpnType))

				if (!cpn) {
					cpn = {
						type: cpnType
					};
					o.components.push(cpn);
				}

				cpn[property] = value;
			} else {
				o[property] = value;
			}
		},
		setObject: function(self, cpnType, object, property, value) {
			var o = this.o;
			if (self)
				o = this.oSelf;
			var cpn = o.components.find(c => (c.type == cpnType))

			if (!cpn) {
				cpn = {
					type: cpnType
				};
				o.components.push(cpn);
			}

			var obj = cpn[object];
			if (!obj) {
				obj = {};
				cpn[object] = obj;
			}

			obj[property] = value;
		},
		setArray: function(self, cpnType, property, value) {
			var o = this.o;
			if (self)
				o = this.oSelf;
			var cpn = o.components.find(c => (c.type == cpnType))

			if (!cpn) {
				cpn = {
					type: cpnType
				};
				o.components.push(cpn);
			}

			if (cpn[property] == null)
				cpn[property] = [];

			cpn[property].push(value);
		},

		setSelfArray: function(self, property, value) {
			var o = this.o;
			if (self)
				o = this.oSelf;

			if (o[property] == null)
				o[property] = [];

			o[property].push(value);
		}
	};
});