module.exports = {
	name: 'Fjolgard',
	level: 20,

	mobs: {
		default: {
			faction: 'fjolgard',
			deathRep: -5
		},

		innkeeper: {
			level: 25,
			deathRep: -7,
			rare: {
				count: 0
			}
		},
		peasant: {
			level: 10,
			rare: {
				count: 0
			}
		},
		'royal guard': {
			level: 50,
			deathRep: -15,

			walkDistance: 0,

			rare: {
				count: 0
			}
		},
		'princess': {
			level: 100,
			deathRep: -50,

			walkDistance: 0,

			rare: {
				count: 0
			}
		},
		'royal guard': {
			level: 50,
			deathRep: -15,

			walkDistance: 0,

			rare: {
				count: 0
			}
		},
		'disciple of flabbers': {
			level: 50,
			deathRep: -15,
			walkDistance: 1,
			rare: {
				count: 0
			}
		},
		estrid: {
			level: 25,
			deathRep: -7,
			walkDistance: 5,

			rare: {
				count: 0
			},

			properties: {
				cpnTrade: {
					items: {
						min: 5,
						max: 10
					},
					level: {
						min: 5,
						max: 15
					},
					markup: {
						buy: 0.25,
						sell: 2.5
					}
				}
			}
		},

		'priest': {
			level: 50,
			deathRep: -15,
			walkDistance: 0,
			rare: {
				count: 0
			},

			properties: {
				cpnTrade: {
					items: {
						min: 5,
						max: 10,
						extra: [{
							type: 'skin',
							id: 'gaekatla druid',
							worth: 100,
							factions: [{
								id: 'gaekatla',
								tier: 7
							}]
						}]
					},
					faction: {
						id: 'gaekatla',
						tier: 1
					},
					markup: {
						buy: 0.25,
						sell: 10
					}
				}
			}
		},

		'mud crab': {
			faction: 'gaekatla',
			grantRep: {
				fjolgard: 3,
				gaekatla: 10
			},
			level: 1,

			rare: {
				name: 'Big Red'
			}
		}
	},
	objects: {
		googzdoor: {
			properties: {
				cpnDoor: {
					locked: true,
					key: 'inn'
				}
			}
		},
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
		shoptola: {
			properties: {
				cpnNotice: {
					actions: {
						enter: {
							cpn: 'dialogue',
							method: 'talk',
							args: [{
								targetName: 'tola'
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