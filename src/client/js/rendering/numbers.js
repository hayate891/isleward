define([
	'js/system/events',
	'js/objects/objects',
	'js/rendering/renderer'
], function(
	events,
	objects,
	renderer
) {
	var scale = 40;
	var scaleMult = 5;

	return {
		list: [],

		init: function() {
			events.on('onGetDamage', this.onGetDamage.bind(this));
		},

		onGetDamage: function(msg) {
			var target = objects.objects.find(function(o) { return (o.id == msg.id); });
			if (!target)
				return;

			var addY = msg.event ? scale : -(scale * 0.75);

			var ttl = 30 * (msg.crit ? 1 : 1);

			var numberObj = {
				obj: target,
				amount: msg.amount,
				x: (target.x * scale) + ~~(Math.random() * scale - (scale / 2)),
				y: (target.y * scale) + addY,
				ttl: ttl,
				ttlMax: ttl,
				event: msg.event,
				text: msg.text,
				crit: msg.crit,
				heal: msg.heal
			};

			var text = numberObj.text;
			if (!numberObj.event)
				text = (numberObj.heal ? '+' : '') + (~~(numberObj.amount * 10) / 10);

			numberObj.sprite = renderer.buildText({
				fontSize: numberObj.crit ? 22 : 18,
				layerName: 'effects',
				x: numberObj.x,
				y: numberObj.y,
				text: text
			});

			this.list.push(numberObj);
		},

		render: function() {
			var list = this.list;
			var lLen = list.length;

			for (var i = 0; i < lLen; i++) {
				var l = list[i];
				l.ttl--;

				if (l.ttl == 0) {
					renderer.destroyObject({
						layerName: 'effects',
						sprite: l.sprite
					});
					list.splice(i, 1);
					i--;
					lLen--;
					continue;
				}

				if (l.event)
					l.y += 0.75;
				else
					l.y -= 0.75;

				var alpha = l.ttl / l.ttlMax;

				l.sprite.x = ~~(l.x / scaleMult) * scaleMult;
				l.sprite.y = ~~(l.y / scaleMult) * scaleMult;
				l.sprite.alpha = alpha;
			}
		}
	};
});