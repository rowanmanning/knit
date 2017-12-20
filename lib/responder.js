'use strict';

const bindLogger = require('./util/bind-logger');
const defaults = require('lodash/defaults');
let Bot; // Not set here to get around circular dependency

/**
 * Class representing a bot responder.
 */
class Responder {

	/**
	 * Create a bot responder.
	 * @param {Object} options - The responder options.
	 * @param {(String|Alias)} [options.alias] - The alias to respond with. This must be either an {@link Alias} or the name of one registered the bot.
	 */
	constructor(options) {
		if (this.constructor === Responder) {
			throw new Error('You cannot create an instance of Responder, it is designed to be extended');
		}
		this.options = defaults({}, options, Responder.defaults);
	}

	/**
	 * Register the responder to a bot.
	 * @access private
	 * @param {Bot} bot - The bot to register to.
	 * @returns {Responder} The calling responder instance.
	 * @throws {TypeError} Will throw if bot is not an instance of Bot.
	 */
	registerToBot(bot) {

		// NOTE: Bot is required here to get around a
		// circular dependency when the module is loaded
		Bot = Bot || require('./bot');

		if (!(bot instanceof Bot)) {
			throw new TypeError('Expected an instance of Bot');
		}

		this.bot = bot;
		this.log = bindLogger(bot.log, `${this.constructor.name}:`);

		return this;
	}

	/**
	 * Create a {@link Response} object which is ready to respond to an incoming message.
	 * @param {Object} message - The Slack message to create a response for.
	 * @returns {Response} The prepared response.
	 */
	respond(message) {
		const response = this.bot.replyTo(message);
		if (this.options.alias) {
			response.as(this.options.alias);
		}
		return response;
	}

	/**
	 * Get the responder as a string, for use in implicit type conversion.
	 * @access private
	 * @returns {String} The string representation.
	 */
	valueOf() {
		return `[object ${this.constructor.name}]`;
	}

	/**
	 * Get the responder as a plain object, for use in JSON conversion.
	 * @access private
	 * @returns {Object} The responder as a plain object.
	 */
	toJSON() {
		return this.options;
	}

	/**
	 * Get console-friendly representation of the responder.
	 * @access private
	 * @returns {String} The console-friendly representation.
	 */
	inspect() {
		return `${this.constructor.name} {}`;
	}

}

/**
 * The default options used when constructing a responder.
 * @static
 */
Responder.defaults = {};

module.exports = Responder;
