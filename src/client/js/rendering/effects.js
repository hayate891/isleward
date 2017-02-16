define([
	'js/canvas'
], function(
	canvas
) {
	return {
		list: [],
		particles: [],
		fog: [],

		register: function(cpn) {
			this.list.push(cpn);
		},
		unregister: function(cpn) {
			var list = this.list;
			var lLen = list.length;

			for (var i = 0; i < lLen; i++) {
				var l = list[i];

				if (l == cpn) {
					list.splice(i, 1);
					return;
				}
			}
		},

		render: function() {
			var list = this.list;
			var lLen = list.length;

			for (var i = 0; i < lLen; i++) {
				var l = list[i];

				if ((l.destroyed) || (l.obj.destroyed)) {
					list.splice(i, 1);
					i--;
					lLen--;

					if (l.destroyManual)
						l.destroyManual();
					
					continue;
				}

				l.renderManual();
			}

			//this.renderParticles(this.particles);
		},
		renderParticles: function(particles) {
			var particles = particles;
			var pLen = particles.length;

			var ctx = canvas.layers.particles.ctx;

			for (var i = 0; i < pLen; i++) {
				var p = particles[i];

				p.ttl--;
				if (p.ttl == 0) {
					particles.splice(i, 1);
					i--;
					pLen--;
					continue;
				}

				p.x += p.dx;
				p.y += p.dy;

				var size = p.size;
				var half = size / 2;

				var o = (p.ttl / p.ttlMax) * p.a;

				var x = ~~((p.x - half) / 4) * 4;
				var y = ~~((p.y - half) / 4) * 4;

				size = ~~(size / 4) * 4;

				if (p.grow)
					p.size += p.grow;
				else if (p.shrink)
					p.size -= p.shrink;

				if (p.stroke) {
					ctx.lineWidth = p.stroke;
					ctx.strokeStyle = 'rgba(' + p.r + ', ' + p.g + ', ' + p.b + ', ' + o + ')';
					ctx.strokeRect(x, y, size, size);
				} else {
					ctx.fillStyle = 'rgba(' + p.r + ', ' + p.g + ', ' + p.b + ', ' + o + ')';
					ctx.fillRect(x, y, size, size);
				}
			}
		}
	};
});