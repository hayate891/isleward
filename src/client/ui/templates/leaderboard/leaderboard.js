define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/leaderboard/template',
	'css!ui/templates/leaderboard/styles'
], function(
	events,
	client,
	template,
	styles
) {
	return {
		tpl: template,

		centered: true,
		modal: true,

		prophecyFilter: null,

		records: [],

		offset: 0,
		pageSize: 10,
		maxOffset: 0,

		postRender: function() {
			this.onEvent('onShowLeaderboard', this.toggle.bind(this, true));

			this.find('.prophecy[prophecy]').on('click', this.onProphecyClick.bind(this));

			this.find('.prophecy-mine').on('click', this.onMine.bind(this));
			this.find('.prophecy-none').on('click', this.onNone.bind(this));

			this.find('.button').on('click', this.onRefresh.bind(this));

			this.find('.buttons .btn').on('click', this.onPage.bind(this));
		},

		onPage: function(e) {
			var el = $(e.currentTarget);
			var offset = ~~el.attr('offset');

			this.offset += offset;
			if (this.offset < 0)
				this.offset = 0;
			else if (this.offset > this.maxOffset)
				this.offset = this.maxOffset;

			this.onGetList(this.records, true);
		},

		onMine: function() {
			var prophecies = window.player.prophecies;
			prophecies = prophecies ? prophecies.list : [];

			prophecies.forEach(function(p) {
				this.onProphecyClick({
					currentTarget: this.find('.prophecy[prophecy="' + p + '"]')
				});
			}, this);
		},

		onNone: function() {
			this.find('.prophecy[prophecy]').removeClass('selected');
			this.prophecyFilter = [];
		},

		onRefresh: function() {
			this.getList();
		},

		onProphecyClick: function(e) {
			var el = $(e.currentTarget);

			el.toggleClass('selected');

			var prophecyName = el.attr('prophecy');

			var exists = this.prophecyFilter.some(function(p) {
				return (p == prophecyName);
			}, this);

			if (exists) {
				this.prophecyFilter.spliceWhere(function(p) {
					return (p == prophecyName);
				}, this);
			}
			else
				this.prophecyFilter.push(prophecyName);
		},

		getList: function() {
			if (!this.prophecyFilter) {
				var prophecies = window.player.prophecies;
				this.prophecyFilter = prophecies ? prophecies.list : [];
			}

			client.request({
				module: 'leaderboard',
				method: 'requestList',
				data: {
					prophecies: this.prophecyFilter
				},
				callback: this.onGetList.bind(this)
			});
		},

		onGetList: function(result, keepOffset) {
			if (!keepOffset) {
				this.offset = 0;

				var foundIndex = result.firstIndex(function(r) {
					return (r.name == window.player.name);
				}, this);
				if (foundIndex != -1)
					this.offset = ~~(foundIndex / this.pageSize);
			}

			this.records = result;

			var container = this.find('.list').empty();

			var low = this.offset * this.pageSize;
			var high = Math.min(result.length, low + this.pageSize);

			this.maxOffset = Math.ceil(result.length / this.pageSize) - 1;

			for (var i = low; i < high; i++) {
				var r = result[i];

				var html = '<div class="row"><div class="col">' + r.level + '</div><div class="col">' + r.name + '</div></div>';
				var el = $(html)
					.appendTo(container);

				if (r.name == window.player.name)
					el.addClass('self');
				if (r.dead)
					el.addClass('disabled');
			}

			this.updatePaging();
		},

		updatePaging: function() {
			this.find('.buttons .btn').removeClass('disabled');

			if (this.offset == 0)
				this.find('.btn-first, .btn-prev').addClass('disabled');
			
			if (this.offset >= this.maxOffset)
				this.find('.btn-next, .btn-last').addClass('disabled');
		},

		toggle: function() {
			var shown = !this.el.is(':visible');

			if (shown) {
				this.find('.prophecy[prophecy]').removeClass('selected');
				var prophecies = window.player.prophecies;
				prophecies = prophecies ? prophecies.list : [];
				prophecies.forEach(function(p) {
					this.find('.prophecy[prophecy="' + p + '"]').addClass('selected');
				}, this);

				this.prophecyFilter = null;

				this.getList();
				this.show();
			}
			else
				this.hide();
		}
	};
});