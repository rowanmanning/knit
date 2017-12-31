'use strict';

const Responder = require('../responder');

/**
 * Class representing a bot help responder.
 */
class HelpResponder extends Responder {

	/**
	 * Create a bot help responder.
	 * @param {Object} options - The responder options.
	 * @param {(String|Alias)} [options.alias] - The alias to respond with. This must be either an {@link Alias} or the name of one registered the bot.
	 */
	constructor(options) {
		super(options);
	}

	/**
	 * Respond to an incoming message with help information.
	 * @param {Object} message - The Slack message to respond to.
	 * @returns {Promise} A promise which resolves when the message is sent.
	 */
	async respond(message) {
		try {
			return await super.respond(message).with({
				text: this.generateHelpOutput() || 'There are no listeners with help information'
			});
		} catch (error) {
			this.log.error(`Error: ${error.message}`);
		}
	}

	/**
	 * Generate formatted help output based on available bot listeners.
	 * @returns {String} The formatted help output.
	 */
	generateHelpOutput() {
		return this.bot.listeners
			.filter(listener => listener.help)
			.map(listener => {
				let helpText = `:${listener.help.emoji}: *${listener.name}:* ${listener.help.description}`;
				if (listener.help.examples.length) {
					for (const example of listener.help.examples) {
						helpText += `\n:grey_question: Example: \`${example}\``;
					}
				}
				return helpText;
			})
			.join('\n\n');
	}

	/**
	 * Create a bot help responder (see {@link HelpResponder} for parameters).
	 * @returns {HelpResponder} The new help responder.
	 */
	static create(...args) {
		return new this(...args);
	}

}

module.exports = HelpResponder;
