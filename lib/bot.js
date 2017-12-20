'use strict';

const Alias = require('./alias');
const bindLogger = require('./util/bind-logger');
const botkit = require('botkit');
const DataManager = require('./data-manager');
const defaults = require('lodash/defaults');
const Listener = require('./listener');
const pick = require('lodash/pick');
const Response = require('./response');

/**
 * Class representing a Slack bot.
 *
 * @example <caption>Create a Slack bot, passing in options</caption>
 * const bot = new Bot({
 *     name: 'ExampleBot',
 *     slackToken: process.env.SLACK_TOKEN
 * });
 *
 * @example <caption>Start the bot</caption>
 * bot.connect()
 *     .then(() => {
 *         console.log('Bot started');
 *     })
 *     .catch((error) => {
 *         console.error(`Bot failed to start: ${error.message}`);
 *     });
 */
class Bot {

	/**
	 * Create a Slack bot.
	 * @param {Object} options - The bot options.
	 * @param {String} options.name - The bot's name.
	 * @param {String} options.slackToken - The token to use when connecting to Slack.
	 * @param {Boolean} [options.includeBotkitLogs=false] - Whether to include Botkit logs in the output.
	 * @param {Boolean} [options.includeBotkitDebugLogs=false] - Whether to include Botkit debug logs in the output.
	 * @param {Object} [options.log] - A logger which has `error` and `info` methods.
	 * @throws {TypeError} Will throw if the name option is not set.
	 * @throws {TypeError} Will throw if the slackToken option is not set.
	 */
	constructor(options) {

		// Default the passed in options so we know we've got
		// everything that we need to start up
		this.options = defaults({}, options, Bot.defaults);

		// Validate the name option
		this.name = this.options.name;
		if (!this.name) {
			throw new TypeError('Bot name must be set');
		}

		// Validate the slackToken option
		this.slackToken = this.options.slackToken;
		if (!this.slackToken) {
			throw new TypeError('Bot slackToken must be set');
		}

		this.log = bindLogger(this.options.log, `${this.name}:`);
		this.alias = {};
		this.listeners = [];

		this.botkit = {};
		this.botkit.controller = botkit.slackbot({
			/* eslint-disable camelcase */
			disable_startup_messages: true,
			/* eslint-enable camelcase */
			logger: {
				log: (type, ...args) => {
					if (this.options.includeBotkitLogs) {
						if (type !== 'debug' || this.options.includeBotkitDebugLogs) {
							return this.log.info(`Botkit [${type}]:`, ...args);
						}
					}
				}
			}
		});
		this.botkit.bot = this.botkit.controller.spawn({
			token: this.options.slackToken
		});

		const dataManager = DataManager.create();
		dataManager.registerToBot(this);

		this.log.info(`✔︎ initialization complete`);
	}

	/**
	 * Extend the bot's functionality.
	 * @param {(Alias|Function|Listener|String)} extension - The extension.
	 * If this is an {@link Alias} or {@link Listener}, it will be registered to the bot.
	 * If this is a function, it will be called with the bot as a first argument.
	 * If this is a string, it will be required as a module and run through this method again.
	 * @returns {*} The return value of the extension call.
	 * @throws {TypeError} Will throw if the extension type is invalid.
	 */
	use(extension) {
		if (typeof extension === 'string') {
			return this.use(require(extension));
		}
		if (extension instanceof Alias) {
			return extension.registerToBot(this);
		}
		if (extension instanceof Listener) {
			return extension.registerToBot(this);
		}
		if (typeof extension === 'function') {
			return extension(this);
		}
		throw new TypeError(`Bot extension cannot be of type "${typeof extension}"`);
	}

	/**
	 * Respond to an incoming message. This method is a shortcut to creating
	 * a new {@link Response} object and setting the incoming message.
	 * @param {Object} incomingMessage - The Slack message to respond to.
	 * @returns {Response} The created response.
	 */
	replyTo(incomingMessage) {
		return Response.create(this).to(incomingMessage);
	}

	/**
	 * Connect to Slack.
	 * @returns {Promise} A promise which resolves when a connection is made.
	 */
	connect() {
		return new Promise((resolve, reject) => {
			this.botkit.bot.startRTM(error => {
				if (error) {
					return reject(new Error(`Bot could not connect to Slack: ${error}`));
				}
				this.log.info(`✔︎ connected to Slack`);
				resolve();
			});
		});
	}

	/**
	 * Get the bot as a string, for use in implicit type conversion.
	 * @access private
	 * @returns {String} The string representation.
	 */
	valueOf() {
		return `[object ${this.constructor.name}]`;
	}

	/**
	 * Get the bot as a plain object, for use in JSON conversion.
	 * @access private
	 * @returns {Object} The bot as a plain object.
	 */
	toJSON() {
		return pick(this, [
			'name'
		]);
	}

	/**
	 * Get console-friendly representation of the bot.
	 * @access private
	 * @returns {String} The console-friendly representation.
	 */
	inspect() {
		return `${this.constructor.name} { '${this.name}' }`;
	}

}

/**
 * The default options used when constructing a bot.
 * @static
 */
Bot.defaults = {
	includeBotkitLogs: false,
	includeBotkitDebugLogs: false,
	log: console
};

module.exports = Bot;
