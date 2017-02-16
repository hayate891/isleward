module.exports = {
	hermit: {
		'1': {
			msg: [{
				msg: `What? Oh...what are you doing here?`,
				options: [1.1, 1.2, 1.3, 1.4, 1.5]
			}],
			options: {
				'1.1': {
					msg: `Me? What are YOU doing in the middle of the wilderness?`,
					goto: 2
				},
				'1.2': {
					msg: `My ship got wrecked, just south of here. I'm stranded on this island.`,
					goto: 3
				},
				'1.3': {
					msg: `Have you scanvenged anything worth selling lately?`,
					goto: 'tradeBuy'
				},
				'1.4': {
					msg: `I have some items you might be interested in.`,
					goto: 'tradeSell'
				},
				'1.5': {
					msg: `I changed my mind, I want to buy something back.`,
					goto: 'tradeBuyback'
				}
			}
		},
		'2': {
			msg: `I ran into some trouble in the city a few years ago. Moving out here seemed preferable to taking up residence in prison.`,
			options: {
				'2.1': {
					msg: `Trouble? What kind of trouble?`,
					goto: '2-1'
				},
				'2.2': {
					msg: `Where is the city?`,
					goto: '2-2'
				},
				'2.3': {
					msg: `I'd like to ask something else.`,
					goto: 1
				}
			}
		},
		'2-1': {
			msg: `Let's just say it was of a royal nature. There are those who would still like to see me in prison, or better yet; dead.`,
			options: {
				'2-1.1': {
					msg: `I'd like to ask something else`,
					goto: 2
				}
			}
		},
		'2-2': {
			msg: `It's on the south-west part of the island. Just don't let your tongue slip about my location.`,
			options: {
				'2-2.1': {
					msg: `I'd like to ask something else`,
					goto: 2
				}
			}
		},
		'3': {
			msg: `You mean you don't know where you are? Where are you from?`,
			options: {
				'3.1': {
					msg: `I don't know. The developer hasn't written me a backstory yet.`,
					goto: '3-1'
				},
				'3.2': {
					msg: `I'd like to ask something else`,
					goto: 2
				}
			}
		},
		'3-1': {
			msg: `Typical...`,
			options: {
				'3-1.1': {
					msg: `I'd like to ask something else`,
					goto: 1
				}
			}
		},
		tradeBuy: {
			cpn: 'trade',
			method: 'startBuy',
			args: [{
				targetName: 'hermit'
			}]
		},
		tradeSell: {
			cpn: 'trade',
			method: 'startSell',
			args: [{
				targetName: 'hermit'
			}]
		},
		tradeBuyback: {
			cpn: 'trade',
			method: 'startBuyback',
			args: [{
				targetName: 'hermit'
			}]
		}
	}
};