define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/fame/template',
	'css!ui/templates/fame/styles'
], function(
	events,
	client,
	template,
	styles
) {
	return {
		tpl: template,
		text: [],

		centeredX: true,
		modal: true,

		postRender: function() {
			
		}
	}
});