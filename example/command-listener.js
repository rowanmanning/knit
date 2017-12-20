'use strict';

// Replace this path with "@rowanmanning/knit" in your own code
const Bot = require('..');

// Create a new bot, expecting a SLACK_TOKEN environment variable
const bot = new Bot({
	name: 'ExampleBot',
	slackToken: process.env.SLACK_TOKEN
});

// Register a bot command which listens for a trigger phrase
// in an @ message and then responds with a standard response
bot.use(new Bot.Listener.Command({

	// The name of the command, used in logging and help text
	name: 'meaning of life',

	// The trigger phrase to listen for. This can be a string,
	// regular expression, or an array of triggers
	trigger: /what('?s| is) the meaning of life/i,

	// The handler can be either a bot responder, or a function.
	// Here, we're using a standard message responder
	handler: new Bot.Responder.Message({
		message: '42'
	})

}));

// Connect the bot to Slack and exit if there's a problem
bot.connect().catch(error => {
	console.error(error.stack);
	process.exit(1);
});
