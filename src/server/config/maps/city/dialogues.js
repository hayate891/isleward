module.exports = {
	estrid: {
		'1': {
			msg: [{
				msg: `Is there anything I can help you with today?`,
				options: [1.1, 1.2, 1.3, 1.4, 1.5]
			}],
			options: {
				'1.1': {
					msg: `How long have you been working here?`,
					goto: 2
				},
				'1.2': {
					msg: `Why do you sell equipment instead of potions?`,
					goto: 3
				},
				'1.3': {
					msg: `I'd like to browse your wares.`,
					goto: 'tradeBuy'
				},
				'1.4': {
					msg: `I have some items to sell`,
					goto: 'tradeSell'
				},
				'1.5': {
					msg: `I want to buy something back`,
					goto: 'tradeBuyback'
				}
			}
		},
		'2': {
			msg: `I haven't been working here long, but I was born and raised here by my mother. She ran the shop before me.`,
			options: {
				'2.1': {
					msg: `Where is your mother now?`,
					goto: '2-1'
				},
				'2.2': {
					msg: `I'd like to ask something else.`,
					goto: 1
				}
			}
		},
		'2-1': {
			msg: `A few months ago, she...took ill. She's been bedridden upstairs ever since.`,
			options: {
				'2-1.1': {
					msg: `I'd like to ask something else.`,
					goto: 1
				}
			}
		},
		'3': {
			msg: `The developer hasn't added alchemy or potions yet. Hopefully he'll do that soon.`,
			options: {
				'3.1': {
					msg: `I'd like to ask something else.`,
					goto: 1
				}
			}
		},
		tradeBuy: {
			cpn: 'trade',
			method: 'startBuy',
			args: [{
				targetName: 'estrid'
			}]
		},
		tradeSell: {
			cpn: 'trade',
			method: 'startSell',
			args: [{
				targetName: 'estrid'
			}]
		},
		tradeBuyback: {
			cpn: 'trade',
			method: 'startBuyback',
			args: [{
				targetName: 'estrid'
			}]
		}
	},
	tola: {
		'1': {
			msg: [{
				msg: `Oh, hi! Welcome to my inn. I'm so glad to finally see a customer!`,
				options: [1.1]
			}],
			options: {
				'1.1': {
					msg: `Has business been bad?`,
					goto: '2'
				}
			}
		},
		'2': {
			msg: [{
				msg: `I'm afraid so. Ever since the guard captain decided that poor people didn't need protection, people have been afraid to even go outside their homes.`,
				options: [2.1]
			}],
			options: {
				'2.1': {
					msg: `Have there been many robberies? Or people killed?`,
					goto: '3'
				}
			}
		},
		'3': {
			msg: [{
				msg: `Killings yes, but these are no robbers. It's those bloodthirsty rats in the sewers; they're getting more courageous by the day. Why, just last week I saw one walking around by the pier. Walking like it owned the place. Stinktooth, I think they call him.`,
				options: [3.1]
			}],
			options: {
				'3.1': {
					msg: `Where can I find this rat? I'll put an end to him.`,
					goto: '4'
				}
			}
		},
		'4': {
			msg: [{
				msg: `When he isn't walking about, scaring children and eating anything slower than him, he mucks about in the sewers; east of here.`,
				options: []
			}]
		}
	},
	priest: {
		'1': {
			msg: [{
				msg: `Is there anything I can help you with today?`,
				options: [1.1, 1.2, 1.3]
			}],
			options: {
				'1.1': {
					msg: `I'd like to browse your wares.`,
					goto: 'tradeBuy'
				},
				'1.2': {
					msg: `I have some items to sell`,
					goto: 'tradeSell'
				},
				'1.3': {
					msg: `I want to buy something back`,
					goto: 'tradeBuyback'
				}
			}
		},
		tradeBuy: {
			cpn: 'trade',
			method: 'startBuy',
			args: [{
				targetName: 'priest'
			}]
		},
		tradeSell: {
			cpn: 'trade',
			method: 'startSell',
			args: [{
				targetName: 'priest'
			}]
		},
		tradeBuyback: {
			cpn: 'trade',
			method: 'startBuyback',
			args: [{
				targetName: 'priest'
			}]
		}
	}
};