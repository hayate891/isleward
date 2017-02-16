define([
	'fs'
], function(
	fs
) {
	return {
		db: null,
		file: 'storage.db',
		exists: false,

		tables: {
			character: null,
			characterList: null,
			stash: null,
			skins: null,
			login: null,
			leaderboard: null,
			customMap: null
		},

		init: function(cbReady) {
			var sqlite = require('sqlite3').verbose();
			this.exists = fs.existsSync(this.file);
			this.db = new sqlite.Database(this.file, this.onDbCreated.bind(this, cbReady));
		},
		onDbCreated: function(cbReady) {
			if (this.exists) {
				cbReady();
				return;
			}

			var db = this.db;
			var tables = this.tables;
			db.serialize(function() {
				for (var t in tables) {
					db.run(`
						CREATE TABLE ${t} (key VARCHAR(50), value TEXT)
					`);
				}

				cbReady();
			}, this);

			this.exists = true;
		},

		//ent, field
		get: function(options) {
			var key = options.ent;
			var table = options.field;

			options.query = `SELECT * FROM ${table} WHERE key = '${key}' LIMIT 1`;

			this.db.get(options.query, this.done.bind(this, options));
		},

		delete: function(options) {
			var key = options.ent;
			var table = options.field;

			options.query = `DELETE FROM ${table} WHERE key = '${key}'`;

			this.db.run(options.query, this.done.bind(this, options));
		},

		//ent, field, value
		set: function(options) {
			var key = options.ent;
			var table = options.field;

			this.db.get(`SELECT 1 FROM ${table} where key = '${key}'`, this.doesExist.bind(this, options));
		},
		doesExist: function(options, err, result) {
			var key = options.ent;
			var table = options.field;

			var query = `INSERT INTO ${table} (key, value) VALUES('${key}', '${options.value}')`;

			if (result)
				query = `UPDATE ${table} SET value = '${options.value}' WHERE key = '${key}'`;

			this.db.run(query, this.done.bind(this, options));
		},

		done: function(options, err, result) {
			result = result || { value: null };

			if (options.callback)
				options.callback(result.value);
		}
	};
});