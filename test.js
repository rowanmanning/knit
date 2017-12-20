'use strict';

const Bot = require('.');

const bot = new Bot({
	name: 'ExampleBot',
	slackToken: process.env.SLACK_TOKEN,
	includeBotkitLogs: true,
	includeBotkitDebugLogs: false
});

// Register a bot alias
bot.use(new Bot.Alias({
	avatar: 'mortar_board', // Emoji name or URL
	name: 'KnowledgeBot' // The name of the bot
}));

// Register a bot command
bot.use(new Bot.Listener.Command({
	name: 'example',
	trigger: 'example',
	handler: new Bot.Responder.Message({
		message: 'Hello'
	})
}));

// Register a bot command which uses an alias
bot.use(new Bot.Listener.Command({
	name: 'teacher',
	trigger: 'teach me',
	handler: new Bot.Responder.RandomMessage({
		alias: 'KnowledgeBot',
		messages: [
			'Fuck off',
			'No thanks',
			'Read a book',
			'Teach yourself'
		]
	})
}));

// Register a bot ambient response
bot.use(new Bot.Listener.Ambient({
	name: 'hoff',
	trigger: 'judehoff',
	handler: new Bot.Responder.Image({
		image: 'http://i.imgur.com/Tfq7Bi7.gif',
		label: 'HOFF THIS',
		color: '#f00'
	})
}));

// Register a bot command
bot.use(new Bot.Listener.Command({
	name: 'goat me',
	trigger: 'goat me',
	handler: new Bot.Responder.RandomImage({
		images: [
			'http://www.doseoffunny.com/wp-content/uploads/2014/04/i.chzbgr-4.gif',
			'https://i.imgur.com/ydM3Wb4.gif',
			'https://media.giphy.com/media/XdACBmg3lx6RG/giphy.gif'
		]
	})
}));

// Connect to Slack
bot.connect()
	.then(async () => {
		console.log(await bot.data.getUserById('USLACKBOT'));
	})
	.catch(error => {
		console.error(error.message);
		process.exit(1);
	});
