'use strict';

const Bot = require('.');

const bot = new Bot({
	name: 'ExampleBot',
	slackToken: process.env.SLACK_TOKEN
});

// Register a bot alias
bot.use(new Bot.Alias({
	avatar: 'mortar_board', // Emoji name or URL
	name: 'KnowledgeBot' // The name of the bot
}));

// Register a bot command
bot.use(new Bot.Listener.Command({
	trigger: 'expand my mind',
	handler: async message => {
		await bot.replyTo(message).as('KnowledgeBot').with('Expand your own mind');
	}
}));

// OR

// Register a bot command
bot.use(new Bot.Listener.Command({
	trigger: 'expand my mind',
	handler: new Bot.Responder.Message({
		alias: 'KnowledgeBot',
		message: 'Expand your own mind'
	})
}));

// Register a bot command with a random response handler
bot.use(new Bot.Listener.Command({
	trigger: 'roll a die',
	handler: new Bot.Responder.RandomMessage({
		messages: [
			'1', '2', '3', '4', '5', '6'
		]
	})
}));

// Register a bot ambient response
bot.use(new Bot.Listener.Ambient({
	trigger: 'judehoff',
	handler: new Bot.Responder.Image({
		alias: 'HoffBot', // Not actually registered at the mo
		image: 'http://i.imgur.com/Tfq7Bi7.gif'
	})
}));

// Add a reaction to a post
bot.use(new Bot.Listener.Ambient({
	trigger: 'boring slack',
	handler: new Bot.Responder.Reaction({
		emoji: 'bs'
	})
}));

bot.connect();
