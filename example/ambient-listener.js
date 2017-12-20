'use strict';

// Replace this path with "@rowanmanning/knit" in your own code
const Bot = require('..');

// Create a new bot, expecting a SLACK_TOKEN environment variable
const bot = new Bot({
	name: 'ExampleBot',
	slackToken: process.env.SLACK_TOKEN
});

// Register a bot listener which listens for a trigger phrase
// and then responds with a standard response
bot.use(new Bot.Listener.Ambient({

	// The name of the listener, used in logging mostly
	name: 'hunger listener',

	// The trigger phrase to listen for. This can be a string,
	// regular expression, or an array of triggers
	trigger: /i'?m hungry/i,

	// The handler can be either a bot responder, or a function.
	// Here, we're using a standard message responder
	handler: new Bot.Responder.Message({
		message: `Hello hungry, I'm ${bot.name}`
	})

}));

// Connect the bot to Slack and exit if there's a problem
bot.connect().catch(error => {
	console.error(error.stack);
	process.exit(1);
});
