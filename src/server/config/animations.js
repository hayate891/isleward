define([

], function(

) {
	return {
		classes: {
			wizard: {
				'2': {
					hitStaff: {
						sheet: 'animChar',
						row: 1,
						col: 5,
						frames: 3,
						frameDelay: 4
					},
					raiseStaff: {
						sheet: 'animChar',
						row: 0,
						col: 3,
						frames: 5,
						frameDelay: 3
					}
				},
				'3': {
					hitStaff: {
						sheet: 'animChar',
						row: 0,
						col: 0,
						frames: 3,
						frameDelay: 4
					},
					raiseStaff: {
						sheet: 'animChar',
						row: 1,
						col: 0,
						frames: 5,
						frameDelay: 3
					}
				}
			},
			cleric: {
				'4': {
					hitStaff: {
						sheet: 'animChar',
						row: 2,
						col: 5,
						frames: 3,
						frameDelay: 5
					},
					raiseStaff: {
						sheet: 'animChar',
						row: 2,
						col: 0,
						frames: 5,
						frameDelay: 4
					}
				},
				'5': {
					hitStaff: {
						sheet: 'animChar',
						row: 3,
						col: 0,
						frames: 3,
						frameDelay: 5
					},
					raiseStaff: {
						sheet: 'animChar',
						row: 3,
						col: 3,
						frames: 5,
						frameDelay: 4
					}
				}
			},
			thief: {
				'6': {
					hitSword: {
						sheet: 'animChar',
						row: 5,
						col: 5,
						frames: 3,
						frameDelay: 5
					},
					raiseHands: {
						sheet: 'animChar',
						row: 5,
						col: 0,
						frames: 5,
						frameDelay: 5
					}
				},
				'7': {
					hitSword: {
						sheet: 'animChar',
						row: 4,
						col: 0,
						frames: 3,
						frameDelay: 5
					},
					raiseHands: {
						sheet: 'animChar',
						row: 4,
						col: 3,
						frames: 5,
						frameDelay: 6
					}
				}
			},
			warrior: {
				'9': {
					hitSword: {
						sheet: 'animChar',
						row: 6,
						col: 0,
						frames: 3,
						frameDelay: 5
					},
					raiseShield: {
						sheet: 'animChar',
						row: 7,
						col: 0,
						frames: 5,
						frameDelay: 7
					}
				},
				'10': {
					hitSword: {
						sheet: 'animChar',
						row: 7,
						col: 5,
						frames: 3,
						frameDelay: 5
					},
					raiseShield: {
						sheet: 'animChar',
						row: 6,
						col: 3,
						frames: 5,
						frameDelay: 7
					}
				}
			}
		},
		mobs: {
			//Chicken
			'14': {
				basic: {
					sheet: 'animMob',
					row: 0,
					col: 5,
					frames: 3,
					frameDelay: 6
				}
			},
			//Hermit
			'33': {
				basic: {
					sheet: 'animMob',
					row: 1,
					col: 2,
					frames: 3,
					frameDelay: 6
				}
			},
			//Rabbit
			'34': {
				basic: {
					sheet: 'animMob',
					row: 0,
					col: 0,
					frames: 1,
					frameDelay: 8
				}
			},
			//Elk
			'35': {
				basic: {
					sheet: 'animMob',
					row: 0,
					col: 1,
					frames: 4,
					frameDelay: 5
				}
			},
			//Seagull
			'36': {
				basic: {
					sheet: 'animMob',
					row: 2,
					col: 0,
					frames: 3,
					frameDelay: 6
				}
			},
			//Goat
			'37': {
				basic: {
					sheet: 'animMob',
					row: 1,
					col: 0,
					frames: 2,
					frameDelay: 7
				}
			},
			//Goat
			'38': {
				basic: {
					sheet: 'animMob',
					row: 2,
					col: 3,
					frames: 3,
					frameDelay: 6
				}
			},
			//Pig
			'39': {
				basic: {
					sheet: 'animMob',
					row: 1,
					col: 5,
					frames: 3,
					frameDelay: 6
				}
			},
			//Frog
			'45': {
				basic: {
					sheet: 'animMob',
					row: 3,
					col: 0,
					frames: 3,
					frameDelay: 6
				}
			},
			//Flamingo
			'44': {
				basic: {
					sheet: 'animMob',
					row: 4,
					col: 0,
					frames: 3,
					frameDelay: 6
				}
			},
			//Gopher
			'46': {
				basic: {
					sheet: 'animMob',
					row: 5,
					col: 0,
					frames: 3,
					frameDelay: 5
				}
			},
			//Aligator
			'47': {
				basic: {
					sheet: 'animMob',
					row: 6,
					col: 0,
					frames: 3,
					frameDelay: 6
				}
			},
			//Crab
			'40': {
				basic: {
					sheet: 'animMob',
					row: 7,
					col: 0,
					frames: 1,
					frameDelay: 8
				}
			},
			//Giant Crab
			'41': {
				basic: {
					sheet: 'animMob',
					row: 8,
					col: 0,
					frames: 3,
					frameDelay: 6
				}
			}
		},
		bosses: {
			'1': {
				raiseHead: {
					sheet: 'animBoss',
					row: 0,
					col: 0,
					frames: 3,
					frameDelay: 4
				}
			},
			'2': {
				basic: {
					sheet: 'animBoss',
					row: 2,
					col: 0,
					frames: 3,
					frameDelay: 4
				},
				peck: {
					sheet: 'animBoss',
					row: 2,
					col: 3,
					frames: 4,
					frameDelay: 4
				}
			}
		}
	};
});