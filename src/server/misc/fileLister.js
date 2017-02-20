define([
	'fs',
	'path'
], function(
	fs,
	fsPath
) {
	return {
		getFolder: function(path) {
			return fs.readdirSync(path).filter(function(file) {
				return !fs.statSync(fsPath.join(path, file)).isDirectory();
			});
		},

		getFolderList: function(path) {
			try {
				return fs.readdirSync(path).filter(function(file) {
					return fs.statSync(fsPath.join(path, file)).isDirectory();
				});
			} catch (e) {
				return [];
			}
		}
	};
});