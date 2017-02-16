module.exports = {
	name: 'Sewer',
	level: 8,

	mobs: {
		default: {
			faction: 'fjolgard',
			deathRep: -5
		},

		'rat': {
			faction: 'flolgard',
			grantRep: {
				fjolgard: 4
			},
			level: 8,

			rare: {
				count: 0
			}
		},

		'stinktooth': {
			faction: 'flolgard',
			grantRep: {
				fjolgard: 10
			},
			level: 11,

			rare: {
				count: 0
			}
		}
	},
	objects: {
		shopestrid: {
			properties: {
				cpnNotice: {
					actions: {
						enter: {
							cpn: 'dialogue',
							method: 'talk',
							args: [{
								targetName: 'estrid'
							}]
						},
						exit: {
							cpn: 'dialogue',
							method: 'stopTalk'
						}
					}
				}
			}
		},
		shoppriest: {
			properties: {
				cpnNotice: {
					actions: {
						enter: {
							cpn: 'dialogue',
							method: 'talk',
							args: [{
								targetName: 'priest'
							}]
						},
						exit: {
							cpn: 'dialogue',
							method: 'stopTalk'
						}
					}
				}
			}
		},
		greencandle: {
			components: {
				cpnLight: {
					simplify: function() {
						return {
							type: 'light',
							blueprint: {
								color: {
									start: ['80f643'],
									end: ['4ac441', '51fc9a', 'd07840']
								},
								lifetime: {
									min: 2,
									max: 6
								}
							}
						}
					}
				}
			}
		},
		alchgreenpot: {
			components: {
				cpnParticles: {
					simplify: function() {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['80f643', '80f643'],
									end: ['4ac441', '4ac441']
								},
								scale: {
									start: {
										min: 2,
										max: 10
									},
									end: {
										min: 0,
										max: 2
									}
								},
								speed: {
									start: {
										min: 4,
										max: 16
									},
									end: {
										min: 2,
										max: 8
									}
								},
								lifetime: {
									min: 1,
									max: 4
								},
								randomScale: true,
								randomSpeed: true,
								chance: 0.1,
								randomColor: true,
								spawnType: 'rect',
								spawnRect: {
									x: -15,
									y: -20,
									w: 30,
									h: 8
								}
							}
						}
					}
				}
			}
		},
		alchredpot: {
			components: {
				cpnParticles: {
					simplify: function() {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['ff4252', 'ff4252'],
									end: ['a82841', 'a82841']
								},
								scale: {
									start: {
										min: 2,
										max: 10
									},
									end: {
										min: 0,
										max: 2
									}
								},
								speed: {
									start: {
										min: 4,
										max: 16
									},
									end: {
										min: 2,
										max: 8
									}
								},
								lifetime: {
									min: 1,
									max: 4
								},
								randomScale: true,
								randomSpeed: true,
								chance: 0.2,
								randomColor: true,
								spawnType: 'rect',
								spawnRect: {
									x: -15,
									y: -28,
									w: 30,
									h: 8
								}
							}
						}
					}
				}
			}
		}
	}
};