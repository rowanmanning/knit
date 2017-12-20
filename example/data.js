'use strict';

// Replace this path with "@rowanmanning/knit" in your own code
const Bot = require('..');

// Create a new bot, expecting a SLACK_TOKEN environment variable
const bot = new Bot({
	name: 'ExampleBot',
	slackToken: process.env.SLACK_TOKEN
});

// Register a bot command which listens for a trigger phrase
// in an @ message and then responds with all users
bot.use(new Bot.Listener.Command({

	// See example/command.js for more explanation on these
	name: 'list users',
	trigger: /list users/i,
	handler: async message => {
		const users = await bot.data.getUsers();
		const userList = users.map(user => user.name).join('\n');
		await bot.replyTo(message).with({
			text: `*Users:*\n${userList}`,
			mrkdwn: true
		});
	}

}));

// Connect the bot to Slack and exit if there's a problem
bot.connect().catch(error => {
	console.error(error.stack);
	process.exit(1);
});
