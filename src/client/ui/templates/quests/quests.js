define([
	'js/system/client',
	'js/system/events',
	'html!ui/templates/quests/template',
	'html!ui/templates/quests/templateQuest',
	'css!ui/templates/quests/styles'
], function(
	client,
	events,
	tpl,
	templateQuest,
	styles
) {
	return {
		tpl: tpl,

		quests: [],
		container: '.right',

		postRender: function() {
			this.onEvent('onRezone', this.onRezone.bind(this));

			this.onEvent('onObtainQuest', this.onObtainQuest.bind(this));
			this.onEvent('onUpdateQuest', this.onUpdateQuest.bind(this));
			this.onEvent('onCompleteQuest', this.onCompleteQuest.bind(this));
		},

		onRezone: function() {
			this.quests = [];
			this.el.find('.list').empty();
		},

		onObtainQuest: function(quest) {
			var list = this.el.find('.list');

			var html = templateQuest
				.replace('$NAME$', quest.name)
				.replace('$DESCRIPTION$', quest.description);

			var el = $(html).appendTo(list);

			if (quest.isReady)
				el.addClass('ready');

			if (quest.active) 
				el.addClass('active');
			else if (!quest.isReady)
				el.addClass('disabled');

			el.on('click', this.onClick.bind(this, el, quest));

			this.quests.push({
				id: quest.id,
				el: el,
				quest: quest
			});

			var quests = list.find('.quest');

			quests
				.sort(function(a, b) {
					a = $(a).hasClass('active') ? 1 : 0;
					b = $(b).hasClass('active') ? 1 : 0;
					return b - a;
				})
				.appendTo(list);
		},


		onClick: function(el, quest) {
			if (!el.hasClass('ready'))
				return;

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'quests',
					method: 'complete',
					data: quest.id
				}
			});
		},

		onUpdateQuest: function(quest) {
			var q = this.quests.find(function(q) {
				return (q.id == quest.id);
			});

			q.quest.isReady = quest.isReady;

			q.el.find('.description').html(quest.description);

			q.el.removeClass('ready');
			if (quest.isReady) {
				q.el.removeClass('disabled');
				q.el.addClass('ready');
			}
		},

		onCompleteQuest: function(id) {
			var q = this.quests.find(function(q) {
				return (q.id == id);
			});

			if (!q)
				return;

			q.el.remove();
			this.quests.spliceWhere(function(q) {
				return (q.id == id);
			});
		}
	}
});