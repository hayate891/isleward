define([
	'../security/io'
], function(
	io
) {
	return {
		list: [],
		waiting: [],
		loaded: false,

		init: function() {
			this.getList();
		},

		requestList: function(msg) {
			var prophecyFilter = msg.data.prophecies;

			var result = this.list;

			if (prophecyFilter) {
				var pLen = prophecyFilter.length;

				result = result
					.filter(function(r) {
						var rProphecies = r.prophecies || [];
						//if (rProphecies.length != pLen)
						//	return false;

						var match = true;
						for (var i = 0; i < pLen; i++) {
							if (!rProphecies.some(rp => rp == prophecyFilter[i])) {
								match = false;
								break;
							}
						}

						return match;
					});
			}

			msg.callback(result);
		},

		getList: function() {
			io.get({
				ent: 'list',
				field: 'leaderboard',
				callback: this.onGetList.bind(this)
			});
		},

		onGetList: function(result) {
			if (!result) {
				var list = {
					list: []
				};

				io.set({
					ent: 'list',
					field: 'leaderboard',
					value: JSON.stringify(list)
				});
			}
			else
				this.parseList(result);

			this.loaded = true;
		},

		parseList: function(result) {
			this.list = JSON.parse(result).list;

			var doSave = false;

			this.waiting.forEach(function(w) {
				if (!this.list.some(l => l.name == w.name)) {
					this.list.push(w);
					doSave = true;
				}
			}, this);

			if (doSave)
				this.save();

			this.waiting = [];
		},

		getLevel: function(name) {
			if (!this.list)
				return null;

			var result = this.list.find(l => (l.name == name));
			if (result)
				return result.level;
			else
				return null;
		},

		setLevel: function(name, level, prophecies) {
			if (!this.list) {
				this.waiting.push({
					name: name,
					level: level,
					prophecies: prophecies
				});

				return;
			}

			var exists = this.list.find(l => l.name == name);
			if (exists) {
				if (exists.level != level) {
					exists.level = level;
					
					this.save();
				}
			}
			else {
				this.list.push({
					name: name,
					level: level,
					prophecies: prophecies
				});

				this.save();
			}
		},

		deleteCharacter: function(name) {
			this.list.spliceWhere(l => (l.name == name));
			this.save();
		},

		killCharacter: function(name) {
			var character = this.list.find(l => (l.name == name));
			if (!character)
				return;

			character.dead = true;
			this.save();
		},

		sort: function() {
			this.list.sort(function(a, b) {
				return (b.level - a.level);
			}, this);
		},

		save: function() {
			this.sort();

			if (!this.loaded)
				return;

			io.set({
				ent: 'list',
				field: 'leaderboard',
				value: JSON.stringify({
					list: this.list
				})
			});
		}
	};
});