'use strict';

const isPlainObject = require('lodash/isPlainObject');
const Responder = require('../responder');

/**
 * Class representing a bot message responder. Message responders always reply
 * with the same canned message. See https://api.slack.com/docs/messages for
 * information on Slack message formatting.
 * @extends Responder
 *
 * @example <caption>Create a message responder</caption>
 * new Bot.Responder.Message({
 *     message: 'Hello World!'
 * });
 *
 * @example <caption>Create a message responder with an alias and more complex Slack message</caption>
 * new Bot.Responder.Message({
 *     alias: 'ExampleAlias',
 *     message: {
 *         text: 'Just wanted to say:',
 *         attachments: [
 *             { text: 'Hello World!' }
 *         ]
 *     }
 * });
 */
class MessageResponder extends Responder {

	/**
	 * Create a bot message responder.
	 * @param {Object} options - The responder options.
	 * @param {(String|Object)} options.message - The message to respond with.
	 * @param {(String|Alias)} [options.alias] - The alias to respond with. This must be either an {@link Alias} or the name of one registered the bot.
	 */
	constructor(options) {
		super(options);
		if (typeof options.message !== 'string' && !isPlainObject(options.message)) {
			throw new TypeError(`${this.constructor.name} message must be a string or object`);
		}
	}

	/**
	 * Respond to an incoming message with the responder message.
	 * @param {Object} message - The Slack message to respond to.
	 * @returns {Promise} A promise which resolves when the message is sent.
	 */
	async respond(message) {
		try {
			return await super.respond(message).with(this.options.message);
		} catch (error) {
			this.log.error(`Error: ${error.message}`);
		}
	}

	/**
	 * Create a bot message responder (see {@link MessageResponder} for parameters).
	 * @returns {MessageResponder} The new message responder.
	 */
	static create(...args) {
		return new this(...args);
	}

}

module.exports = MessageResponder;
