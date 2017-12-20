'use strict';

// Replace this path with "@rowanmanning/knit" in your own code
const Bot = require('..');

// Create a new bot, expecting a SLACK_TOKEN environment variable
const bot = new Bot({
	name: 'ExampleBot',
	slackToken: process.env.SLACK_TOKEN
});

// Register a bot alias, note the name is different to the bot name
bot.use(new Bot.Alias({

	// Emoji name or an image URL
	avatar: 'yum',

	// The name of the alias
	name: 'HungerBot'

}));

// Register the same listener as the basic listener example, but
// with an alias specified
bot.use(new Bot.Listener.Ambient({

	// See example/listener.js for more explanation on these
	name: 'hunger listener',
	trigger: /i'?m hungry/i,
	handler: new Bot.Responder.Message({

		// The name of the alias to use
		alias: 'HungerBot',

		// The message to respond with
		message: `Hello hungry, I'm HungerBot`

	})

}));

// Connect the bot to Slack and exit if there's a problem
bot.connect().catch(error => {
	console.error(error.stack);
	process.exit(1);
});
