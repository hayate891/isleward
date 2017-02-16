define([
	'misc/fileLister'
], function(
	fileLister
) {
	var onReady = null;

	var components = {
		components: {},
		waiting: null,

		init: function(callback) {
			onReady = callback;
			this.getComponentNames();
		},
		getComponentNames: function() {
			this.waiting = fileLister.getFolder('./components/');
			this.waiting = this.waiting.filter(w => (
				(w.indexOf('components') == -1) && 
				(w.indexOf('cpnBase') == -1) &&
				(w.indexOf('projectile') == -1)
			));
			this.onGetComponentNames();
		},
		onGetComponentNames: function() {
			for (var i = 0; i < this.waiting.length; i++) {
				var name = this.waiting[i];
				this.getComponent(name);
			}
		},
		getComponent: function(name) {
			require([ './components/' + name ], this.onGetComponent.bind(this));
		},
		onGetComponent: function(template) {
			this.waiting.spliceWhere(w => w == template.type + '.js');

			this.components[template.type] = template;

			if (this.waiting.length == 0) {
				delete this.waiting;
				onReady();
			}
		}
	};

	return components;
});