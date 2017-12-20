'use strict';

const isPlainObject = require('lodash/isPlainObject');
const Responder = require('../responder');
const sample = require('lodash/sample');

/**
 * Class representing a bot random message responder. Random message responders
 * always reply with a randomly selected canned message from a list.
 * See https://api.slack.com/docs/messages for information on Slack message formatting.
 * @extends Responder
 *
 * @example <caption>Create a random message responder</caption>
 * new Bot.Responder.RandomMessage({
 *     messages: [
 *         'Hello World!',
 *         'Goodbye World!'
 *     ]
 * });
 */
class RandomMessageResponder extends Responder {

	/**
	 * Create a bot random message responder.
	 * @param {Object} options - The responder options.
	 * @param {(String[]|Object[])} options.messages - The messages to respond with, one will be randomly picked each time.
	 * @param {(String|Alias)} [options.alias] - The alias to respond with. This must be either an {@link Alias} or the name of one registered the bot.
	 */
	constructor(options) {
		super(options);
		if (!Array.isArray(options.messages)) {
			throw new TypeError(`${this.constructor.name} messages must be an array`);
		}
		for (const message of options.messages) {
			if (typeof message !== 'string' && !isPlainObject(message)) {
				throw new TypeError(`${this.constructor.name} messages must be an array of strings or objects`);
			}
		}
	}

	/**
	 * Respond to an incoming message with a random responder message.
	 * @param {Object} message - The Slack message to respond to.
	 * @returns {Promise} A promise which resolves when the message is sent.
	 */
	async respond(message) {
		try {
			return await super.respond(message).with(sample(this.options.messages));
		} catch (error) {
			this.log.error(`Error: ${error.message}`);
		}
	}

	/**
	 * Create a bot random message responder (see {@link RandomMessageResponder} for parameters).
	 * @returns {RandomMessageResponder} The new random message responder.
	 */
	static create(...args) {
		return new this(...args);
	}

}

module.exports = RandomMessageResponder;
