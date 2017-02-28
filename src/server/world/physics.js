define([
	'misc/pathfinder'
], function(
	pathfinder
) {
	var sqrt = Math.sqrt.bind(Math);
	var ceil = Math.ceil.bind(Math);
	var random = Math.random.bind(Math);

	return {
		graph: null,

		collisionMap: null,
		cells: [],
		width: 0,
		height: 0,

		init: function(collisionMap) {
			this.collisionMap = collisionMap;

			this.width = collisionMap.length;
			this.height = collisionMap[0].length;

			this.cells = _.get2dArray(this.width, this.height, 'array');

			this.graph = new pathfinder.Graph(collisionMap, {
				diagonal: true
			});
		},

		addRegion: function(obj) {
			var lowX = obj.x;
			var lowY = obj.y;
			var highX = lowX + obj.width;
			var highY = lowY + obj.height;
			var cells = this.cells;

			for (var i = lowX; i < highX; i++) {
				var row = cells[i];
				for (var j = lowY; j < highY; j++) {
					if (!row[j])
						continue;
					row[j].push(obj);
				}
			}
		},

		addObject: function(obj, x, y, fromX, fromY) {
			var row = this.cells[x];

			if (!row)
				return;

			var cell = row[y];

			if (!cell)
				return;

			var cLen = cell.length;
			for (var i = 0; i < cLen; i++) {
				var c = cell[i];

				//If we have fromX and fromY, check if the target cell doesn't contain the same obj (like a notice area)
				if ((c.width) && (fromX)) {
					if ((fromX < c.x) || (fromY < c.y) || (fromX >= c.x + c.width) || (fromY >= c.y + c.height)) {
						c.collisionEnter(obj);
						obj.collisionEnter(c);
					}
				} else {
					//If a callback returns true, it means we collide
					if (c.collisionEnter(obj))
						return;
					obj.collisionEnter(c);
				}
			}

			cell.push(obj);
			return true;
		},
		removeObject: function(obj, x, y, toX, toY) {
			var row = this.cells[x];

			if (!row)
				return;

			var cell = row[y];

			if (!cell)
				return;

			var oId = obj.id;
			var cLen = cell.length;
			for (var i = 0; i < cLen; i++) {
				var c = cell[i];

				if (c.id != oId) {
					//If we have toX and toY, check if the target cell doesn't contain the same obj (like a notice area)
					if ((c.width) && (toX)) {
						if ((toX < c.x) || (toY < c.y) || (toX >= c.x + c.width) || (toY >= c.y + c.height)) {
							c.collisionExit(obj);
							obj.collisionExit(c);
						}
					} else {
						c.collisionExit(obj);
						obj.collisionExit(c);
					}
				} else {
					cell.splice(i, 1);
					i--;
					cLen--;
				}
			}
		},

		isValid: function(x, y) {
			var row = this.cells[x];

			if ((!row) || (row.length <= y) || (!this.graph.grid[x][y]))
				return false;
			else
				return true;
		},

		getCell: function(x, y) {
			var row = this.cells[x];

			if (!row)
				return [];

			var cell = row[y];

			if (!cell)
				return [];

			return cell;
		},
		getArea: function(x1, y1, x2, y2, filter) {
			var width = this.width;
			var height = this.height;

			x1 = ~~x1;
			y1 = ~~y1;

			x2 = ~~x2;
			y2 = ~~y2;

			if (x1 < 0)
				x1 = 0;
			if (x2 >= width)
				x2 = width - 1;
			if (y1 < 0)
				y1 = 0;
			if (y2 >= height)
				y2 = height - 1;
			
			var cells = this.cells;
			var grid = this.graph.grid;

			var result = [];
			for (var i = x1; i <= x2; i++) {
				var row = cells[i];
				var gridRow = grid[i];
				for (var j = y1; j <= y2; j++) {
					if (!gridRow[j])
						continue;

					var cell = row[j];
					var cLen = cell.length;
					for (var k = 0; k < cLen; k++) {
						var c = cell[k];

						if (filter) {
							if (filter(c))
								result.push(c);
						} else
							result.push(c);
					}
				}
			}

			return result;
		},

		getOpenCellInArea: function(x1, y1, x2, y2) {
			var width = this.width;
			var height = this.height;

			x1 = ~~x1;
			y1 = ~~y1;

			x2 = ~~x2;
			y2 = ~~y2;

			if (x1 < 0)
				x1 = 0;
			else if (x2 >= width)
				x2 = width - 1;
			if (y1 < 0)
				y1 = 0;
			else if (y2 >= height)
				y2 = height - 1;

			var cells = this.cells;
			var grid = this.graph.grid;

			for (var i = x1; i <= x2; i++) {
				var row = cells[i];
				var gridRow = grid[i];
				for (var j = y1; j <= y2; j++) {
					if (!gridRow[j])
						continue;

					var cell = row[j];
					if (cell.length == 0) {
						return {
							x: i,
							y: j
						};
					} else {
						//If the only contents are notices, we can still use it
						var allNotices = !cell.some(c => !c.notice);
						if (allNotices) {
							return {
								x: i,
								y: j
							};
						}
					}
				}
			}

			return null;
		},

		getPath: function(from, to) {
			var graph = this.graph;
			var grid = graph.grid;

			if (!to) {
				to = {
					x: ~~(random() * grid.length),
					y: ~~(random() * grid[0].length)
				};
			}

			var fromX = ~~from.x;
			var fromY = ~~from.y;

			if ((!grid[fromX]) || (grid[fromX].length <= fromY) || (fromX < 0) || (fromY < 0))
				return [];

			var toX = ~~to.x;
			var toY = ~~to.y;

			if ((!grid[toX]) || (grid[toX].length <= toY) || (toX < 0) || (toY < 0))
				return [];

			var path = pathfinder.astar.search(graph, {
				x: fromX,
				y: fromY
			}, {
				x: toX,
				y: toY
			}, {
				closest: true
			});

			return path;
		},
		isTileBlocking: function(x, y) {
			if ((x < 0) || (y < 0) || (x >= this.width) | (y >= this.height))
				return true;

			x = ~~x;
			y = ~~y;

			var node = this.graph.grid[x][y];
			if (node)
				return node.isWall();
			else
				return true;
		},
		isCellOpen: function(x, y) {
			if ((x < 0) || (y < 0) || (x >= this.width) | (y >= this.height))
				return true;

			var cells = this.cells[x][y];
			var cLen = cells.length;
			for (var i = 0; i < cLen; i++) {
				var c = cells[i];
				if (!c.notice)
					return false;
			}

			return true;
		},
		hasLos: function(fromX, fromY, toX, toY) {
			if ((fromX < 0) || (fromY < 0) || (fromX >= this.width) | (fromY >= this.height) || (toX < 0) || (toY < 0) || (toX >= this.width) | (toY >= this.height))
				return false;

			var graphGrid = this.graph.grid;

			if ((!graphGrid[fromX][fromY]) || (!graphGrid[toX][toY]))
				return false;

			var dx = toX - fromX;
			var dy = toY - fromY;

			var distance = sqrt((dx * dx) + (dy * dy));

			dx /= distance;
			dy /= distance;

			fromX += 0.5;
			fromY += 0.5;

			distance = ceil(distance);

			var x = 0;
			var y = 0;

			for (var i = 0; i < distance; i++) {
				fromX += dx;
				fromY += dy;

				x = ~~fromX;
				y = ~~fromY;

				if (!graphGrid[x][y])
					return false;
				else if ((x == toX) && (y == toY))
					return true;
			}

			return true;
		},

		getClosestPos: function(fromX, fromY, toX, toY, target) {
			var tried = {};

			var hasLos = this.hasLos.bind(this, toX, toY);

			var width = this.width;
			var height = this.height;

			var collisionMap = this.collisionMap;
			var cells = this.cells;

			var reverseX = (fromX > toX);
			var reverseY = (fromY > toY);

			for (var c = 1; c <= 10; c++) {
				var x1 = toX - c;
				var y1 = toY - c;
				var x2 = toX + c;
				var y2 = toY + c;

				var lowX, lowY, highX, highY, incX, incY;

				if (reverseX) {
					incX = -1;
					lowX = x2;
					highX = x1 - 1;
				}
				else {
					incX = 1;
					lowX = x1;
					highX = x2 + 1;
				}

				if (reverseY) {
					incY = -1;
					lowY = y2;
					highY = y1 - 1;
				}
				else {
					incY = 1;
					lowY = y1;
					highY = y2 + 1;
				}

				for (var i = lowX; i != highX; i += incX) {
					if ((i < 0) || (i >= width))
						continue;

					var row = collisionMap[i];
					var cellRow = cells[i];

					var t = tried[i];
					if (!t) {
						t = tried[i] = {};
					}

					for (var j = lowY; j != highY; j += incY) {
						if (t[j])
							continue;

						t[j] = 1;

						if (
							((i == toX) && (j == toY)) ||
							((j < 0) || (j >= height)) ||
							(row[j])
						)
							continue;

						var cell = cellRow[j];
						var cLen = cell.length;
						var blocking = false;
						for (var k = 0; k < cLen; k++) {
							var aggro = cell[k].aggro;
							if (aggro) {
								blocking = aggro.list.some(a => a.obj == target);
								if (blocking)
									break;
							}
						}
						if (blocking)
							continue;
						else if (!hasLos(i, j))
							continue;

						return {
							x: i,
							y: j
						};
					}
				}
			}
		},

		mobsCollide: function(x, y, obj) {
			if ((x < 0) || (y < 0) || (x >= this.width) | (y >= this.height))
				return true;

			var cell = this.cells[x][y];
			var cLen = cell.length;

			if (cLen == 1)
				return false;

			var found = false;
			for (var i = 0; i < cLen; i++) {
				var c = cell[i];
				if (c.aggro) {
					if ((!found) && (c == obj))
						found = true;
					else
						return true;
				}
			}

			return false;
		},

		setCollision: function(x, y, collides) {
			var grid = this.graph.grid;
			if (!grid[x][y]) {
				grid[x][y] = new pathfinder.astar.GridNode(x, y, collides ? 0 : 1);
			}
			else {
				grid[x][y].weight = collides ? 0 : 1;
				pathfinder.astar.cleanNode(grid[x][y]);
			}
		}
	};
});