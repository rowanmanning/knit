'use strict';

const Alias = require('./alias');
const defaults = require('lodash/defaults');
const isPlainObject = require('lodash/isPlainObject');
let Bot; // Not set here to get around circular dependency

/**
 * Class representing a response to a Slack message.
 *
 * @example <caption>Respond to a Slack message</caption>
 * await Bot.Response.create(bot)
 *     .to(message)  // a Botkit message object
 *     .as(alias)    // an alias instance or the name of one
 *     .with('Hello World!');
 *
 * @example <caption>Respond to a Slack message using a bot method</caption>
 * const bot = new Bot();
 * await bot.replyTo(message).with('Hello World!');
 */
class Response {

	/**
	 * Create a bot response.
	 * @param {Bot} bot - The bot to use when responding.
	 * @throws {TypeError} Will throw if bot is not an instance of Bot.
	 */
	constructor(bot) {

		// NOTE: Bot is required here to get around a
		// circular dependency when the module is loaded
		Bot = Bot || require('./bot');

		if (!(bot instanceof Bot)) {
			throw new TypeError('Expected an instance of Bot');
		}

		this.bot = bot;
		this.message = {};
	}

	/**
	 * Set the incoming message to respond to.
	 * @param {Object} incomingMessage - The Slack message to respond to.
	 * @returns {Response} The calling response instance.
	 * @throws {TypeError} Will throw if incoming message is not a Slack message.
	 */
	to(incomingMessage) {

		if (!isPlainObject(incomingMessage)) {
			throw new TypeError('Expected an object');
		}
		if (typeof incomingMessage.text !== 'string') {
			throw new TypeError('Expected a text property on Slack message');
		}
		if (typeof incomingMessage.ts !== 'string') {
			throw new TypeError('Expected a ts property on Slack message');
		}
		if (typeof incomingMessage.user !== 'string') {
			throw new TypeError('Expected a user property on Slack message');
		}

		this.incomingMessage = incomingMessage;
		return this;
	}

	/**
	 * Set an alias to respond with.
	 * @param {(String|Alias)} alias - The alias to respond with. This must be either an {@link Alias} or the name of one registered the bot.
	 * @returns {Response} The calling response instance.
	 * @throws {TypeError} Will throw if the alias is not known.
	 */
	as(alias) {
		if (typeof alias === 'string') {
			if (!this.bot.alias[alias]) {
				throw new TypeError(`${alias} is not the name of a registered alias`);
			}
			alias = this.bot.alias[alias];
		}
		if (!(alias instanceof Alias)) {
			throw new TypeError('Expected a string or an instance of Alias');
		}
		this.alias = alias;
		this.message = defaults({}, this.alias.composeMessage(), this.message);
		return this;
	}

	// TODO add the ability to whisper

	/**
	 * Set the outgoing message.
	 * @param {(String|Object)} outgoingMessage - The message to respond with.
	 * @returns {Promise} A promise which resolves when the message is sent.
	 * @throws {TypeError} Will throw if the outgoing message is invalid.
	 */
	with(outgoingMessage) {

		if (typeof outgoingMessage === 'string') {
			outgoingMessage = {
				text: outgoingMessage
			};
		}
		if (!isPlainObject(outgoingMessage)) {
			throw new TypeError('Expected an object');
		}

		this.message = defaults({}, outgoingMessage, this.message);

		return new Promise((resolve, reject) => {
			this.bot.botkit.bot.reply(this.incomingMessage, this.message, (error, slackResponse) => {
				if (error) {
					return reject(new Error(`Bot could not send message to Slack: ${error}`));
				}
				resolve(slackResponse);
			});
		});
	}

	/**
	 * Get the response as a string, for use in implicit type conversion.
	 * @access private
	 * @returns {String} The string representation.
	 */
	valueOf() {
		return this.message.text;
	}

	/**
	 * Get the response as a plain object, for use in JSON conversion.
	 * @access private
	 * @returns {Object} The response as a plain object.
	 */
	toJSON() {
		return this.message;
	}

	/**
	 * Get console-friendly representation of the response.
	 * @access private
	 * @returns {String} The console-friendly representation.
	 */
	inspect() {
		return `${this.constructor.name} { '${this.message.text}' }`;
	}

	/**
	 * Create a bot command (see {@link Response} for parameters).
	 * @returns {Response} The new command.
	 */
	static create(...args) {
		return new this(...args);
	}

}

module.exports = Response;
