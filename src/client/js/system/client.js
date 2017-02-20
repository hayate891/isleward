define([
	'socket',
	'js/system/events'
], function(
	io,
	events
) {
	var client = {
		doneConnect: false,

		init: function(onReady) {
			var tType = 'websocket';
			if (window.location.href.indexOf('polling') > -1)
				tType = 'polling';

			this.socket = io({
				transports: [ tType ]
			});

			this.socket.on('connect', this.onConnected.bind(this, onReady));
			this.socket.on('handshake', this.onHandshake.bind(this));
			this.socket.on('event', this.onEvent.bind(this));
			this.socket.on('events', this.onEvents.bind(this));
			this.socket.on('dc', this.onDisconnect.bind(this));
		},
		onConnected: function(onReady) {
			if (this.doneConnect)
				this.onDisconnect();
			else
				this.doneConnect = true;

			if (onReady)
				onReady();
		},
		onDisconnect: function() {
			window.location = window.location;
		},
		onHandshake: function() {
			events.emit('onHandshake');
			this.socket.emit('handshake');
		},
		request: function(msg) {
			this.socket.emit('request', msg, msg.callback);
		},
		onEvent: function(response) {
			events.emit(response.event, response.data);
		},
		onEvents: function(response) {
			//If we get objects, self needs to be first
			// otherwise we might create the object (setting his position or attack animation)
			// before instantiating it
			var oList = response.onGetObject;
			if (oList) {
				var prepend = oList.filter(function(o) {
					return o.self;
				});
				oList.spliceWhere(function(o) {
					return prepend.some(function(p) { return p == o; });
				});
				oList.unshift.apply(oList, prepend);
			}

			for (var e in response) {
				var r = response[e];
				r.forEach(function(o) {
					events.emit(e, o);
				});
			}
		}
	};

	return client;
});