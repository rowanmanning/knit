
# Knit

Knit is an abstraction on top of [Botkit] which I've pretty much just built for one bot for myself. You're free to use, but it might not get the _best_ level of support and it has only been tested with Slack

**⚠️ NOTE: This project is no longer being maintained. If you're interested in taking over maintenance, please contact me.**

[![NPM version][shield-npm]][info-npm]
[![Node.js version support][shield-node]][info-node]
[![Build status][shield-build]][info-build]
[![MIT licensed][shield-license]][info-license]

```js
const bot = new Bot({
	name: 'ExampleBot',
	slackToken: 'xxxx-xxx-xxxx'
});

bot.use(new Bot.Listener.Ambient({
	name: 'example listener',
	trigger: /i'?m hungry/i,
	handler: new Bot.Responder.Message({
		message: `Hello hungry, I'm ${bot.name}`
	})
}));

bot.connect();
```


## Table of Contents

  * [Requirements](#requirements)
  * [Usage](#usage)
  * [API Documentation](#api-documentation)
  * [Examples](#examples)
  * [Contributing](#contributing)
  * [License](#license)


## Requirements

Knit requires the following to run:

  * [Node.js] 8+
  * [npm] (normally comes with Node.js)


## Usage

This usage guide covers the basics of using Knit. The full [API documentation is available here][api-docs].

Install Knit with [npm]:

```sh
npm install @rowanmanning/knit
```

Include Knit in your code:

```js
const Bot = require('@rowanmanning/knit');
```

Create and run a bot:

```js
const bot = new Bot({
	name: 'ExampleBot',
	slackToken: 'xxxx-xxx-xxxx'
});

bot.connect();
```

Create a listener which responds with a canned message:

```js
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
```


## API Documentation

You can find the [full API Documentation here][api-docs].


## Examples

There are several examples in the [`example` directory](https://github.com/rowanmanning/knit/tree/master/example). You can run these providing a `SLACK_TOKEN` environment variable to see them in action.


## Contributing

To contribute to Knit, clone this repo locally and commit your code on a separate branch. Please write unit tests for your code, and run the linter before opening a pull-request:

```sh
make test    # run all tests
make verify  # run all linters
```


## License

Knit is licensed under the [MIT] license.<br/>
Copyright &copy; 2017, Rowan Manning



[api-docs]: http://knit.rowanmanning.com/
[botkit]: https://botkit.ai/
[mit]: LICENSE
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/

[info-license]: LICENSE
[info-node]: package.json
[info-npm]: https://www.npmjs.com/package/@rowanmanning/knit
[info-build]: https://travis-ci.org/rowanmanning/knit
[shield-license]: https://img.shields.io/badge/license-MIT-blue.svg
[shield-node]: https://img.shields.io/badge/node.js%20support-8-brightgreen.svg
[shield-npm]: https://img.shields.io/npm/v/@rowanmanning/knit.svg
[shield-build]: https://img.shields.io/travis/rowanmanning/knit/master.svg
