define([
	'js/system/events',
	'js/rendering/renderer'
], function(
	events,
	renderer
) {
	return {
		axes: {
			horizontal: {
				negative: ['left', 'a', 'q', 'z'],
				positive: ['right', 'd', 'e', 'c']
			},
			vertical: {
				negative: ['up', 'w', 'q', 'e'],
				positive: ['down', 's', 'x', 'z', 'c']
			}
		},

		mappings: {
			'8': 'backspace',
			'9': 'tab',
			'13': 'enter',
			'16': 'shift',
			'17': 'ctrl',
			'27': 'esc',
			'37': 'left',
			'38': 'up',
			'39': 'right',
			'40': 'down',
			'46': 'del'
		},

		mouse: {
			button: null,
			x: 0,
			y: 0
		},
		mouseRaw: null,

		keys: {},

		enabled: true,

		init: function() {
			$(window).on('keydown', this.events.keyboard.keyDown.bind(this));
			$(window).on('keyup', this.events.keyboard.keyUp.bind(this));
			events.on('onSceneMove', this.events.mouse.mouseMove.bind(this));

			$('.ui-container')
				.on('mousedown', this.events.mouse.mouseDown.bind(this))
				.on('mouseup', this.events.mouse.mouseUp.bind(this))
				.on('mousemove', this.events.mouse.mouseMove.bind(this));
		},

		resetKeys: function() {
			for (var k in this.keys) {
				events.emit('onKeyUp', k);
			}

			this.keys = {};
		},

		getMapping: function(charCode) {
			if (charCode >= 97)
				return (charCode - 96).toString();

			return (
				this.mappings[charCode] ||
				String.fromCharCode(charCode).toLowerCase()
			);

		},

		isKeyDown: function(key, noConsume) {
			var down = this.keys[key];
			if (down != null) {
				if (noConsume)
					return true;
				else {
					this.keys[key] = 2;
					return (down == 1);
				}
			} else
				return false;
		},
		getAxis: function(name) {
			var axis = this.axes[name];
			if (!axis)
				return 0;

			var result = 0;

			for (var i = 0; i < axis.negative.length; i++) {
				if (this.keys[axis.negative[i]]) {
					result--;
					break;
				}
			}

			for (var i = 0; i < axis.positive.length; i++) {
				if (this.keys[axis.positive[i]]) {
					result++;
					break;
				}
			}

			return result;
		},

		events: {
			keyboard: {
				keyDown: function(e) {
					if (!this.enabled)
						return;

					if (e.target != document.body)
						return true;
					if ((e.keyCode == 9) || (e.keyCode == 8) || (e.keyCode == 122))
						e.preventDefault();

					var key = this.getMapping(e.which);

					if (this.keys[key] != null)
						this.keys[key] = 2;
					else {
						this.keys[key] = 1;
						events.emit('onKeyDown', key);
					}

					if (key == 'backspace')
						return false;
					else if (e.key == 'F11')
						events.emit('onToggleFullscreen');

				},
				keyUp: function(e) {
					if (!this.enabled)
						return;

					if (e.target != document.body)
						return;

					var key = this.getMapping(e.which);

					delete this.keys[key];

					events.emit('onKeyUp', key);
				}
			},
			mouse: {
				mouseDown: function(e) {
					var el = $(e.target);
					if ((!el.hasClass('ui-container')) || (el.hasClass('blocking')))
						return;

					var button = e.button;
					this.mouse.button = button;
					this.mouse.down = true;
					this.mouse.event = e;

					events.emit('mouseDown', this.mouse);
				},
				mouseUp: function(e) {
					var el = $(e.target);
					if ((!el.hasClass('ui-container')) || (el.hasClass('blocking')))
						return;

					var button = e.button;
					this.mouse.button = null;
					this.mouse.down = false;

					events.emit('mouseUp', this.mouse);
				},
				mouseMove: function(e) {
					if (e)
						this.mouseRaw = e;
					else
						e = this.mouseRaw;

					if (!e)
						return;

					var el = $(e.target);
					if ((!el.hasClass('ui-container')) || (el.hasClass('blocking')))
						return;

					this.mouse.x = e.offsetX + (renderer.pos.x);
					this.mouse.y = e.offsetY + (renderer.pos.y);

					events.emit('mouseMove', this.mouse);
				}
			}
		}
	};
});