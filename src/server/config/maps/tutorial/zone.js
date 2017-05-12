module.exports = {
	level: 2,
	resources: {
		Moonbell: {
			type: 'herb',
			max: 5
		},
		Skyblossom: {
			type: 'herb',
			max: 3
		},
		Emberleaf: {
			type: 'herb',
			max: 1
		}
	},
	objects: {
		shophermit: {
			properties: {
				cpnNotice: {
					actions: {
						enter: {
							cpn: 'dialogue',
							method: 'talk',
							args: [{
								targetName: 'hermit'
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
		'estuary entrance': {
			components: {
				cpnParticles: {
					simplify: function() {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['48edff', '80f643'],
									end: ['80f643', '48edff']
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
								chance: 0.075,
								randomColor: true,
								spawnType: 'rect',
								spawnRect: {
									x: -32,
									y: -48,
									w: 64,
									h: 64
								}
							}
						}
					}
				}
			}
		}
	},
	mobs: {
		default: {
			regular: {
				drops: {
					chance: 35,
					rolls: 1
				}
			}
		},
		'crazed seagull': {
			level: 1,

			rare: {
				count: 0
			},

			regular: {
				drops: {
					chance: 100,
					rolls: 1,
					noRandom: true,
					blueprints: [{
						maxLevel: 2,
						name: 'Family Heirloom',
						quality: 2,
						slot: 'neck',
						type: 'Pendant',
						noSalvage: true,
						stats: ['hpMax', 'regenHp', 'regenMana']
					}]
				}
			}
		},
		seagull: {
			level: 2,
			regular: {
				drops: {
					chance: 75,
					rolls: 1
				}
			},
			rare: {
				count: 0
			},
			questItem: {
				name: 'Gull Feather',
				sprite: [0, 0]
			}
		},
		bunny: {
			level: 3,
			regular: {
				drops: {
					chance: 65,
					rolls: 1
				}
			},
			rare: {
				name: 'Thumper'
			},
			questItem: {
				name: "Rabbit's Foot",
				sprite: [0, 1]
			}
		},
		elk: {
			level: 4,
			regular: {
				drops: {
					chance: 55,
					rolls: 1
				}
			},
			rare: {
				name: 'Ironhorn'
			},
			questItem: {
				name: "Elk Antler",
				sprite: [0, 2]
			}
		},
		crab: {
			faction: 'gaekatla',
			deathRep: -3,
			level: 5,

			regular: {
				drops: {
					chance: 45,
					rolls: 1
				}
			},
			rare: {
				name: 'Squiggles'
			},
			questItem: {
				name: 'Severed Pincer',
				sprite: [0, 3]
			}
		},
		'titan crab': {
			faction: 'gaekatla',
			deathRep: -5,
			level: 6,
			rare: {
				name: 'The Pincer King'
			}
		},
		hermit: {
			level: 10,
			walkDistance: 0,
			attackable: false,
			rare: {
				count: 0
			},
			properties: {
				cpnTrade: {
					items: {
						min: 3,
						max: 5
					},
					level: {
						min: 1,
						max: 5
					},
					markup: {
						buy: 0.25,
						sell: 2.5
					}
				}
			}
		},
		rodriguez: {
			attackable: false,
			level: 10,
			rare: {
				count: 0
			}
		},
		pig: {
			attackable: false,
			level: 3,
			grantReputation: null,
			rare: {
				count: 0
			}
		},
		goat: {
			attackable: false,
			level: 3,
			grantReputation: null,
			rare: {
				count: 0
			}
		},
		cow: {
			attackable: false,
			level: 3,
			grantReputation: null,
			rare: {
				count: 0
			}
		}
	}
}; 