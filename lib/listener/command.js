'use strict';

const Listener = require('../listener');

/**
 * Class representing a bot Command. Commands can be used to respond
 * to user messages or act on certain trigger phrases being mentioned
 * but differ from {@link Listener}s in that they require the bot to
 * be directly mentioned. Commands can make use of regular methods,
 * or {@link Responder}s
 * @extends Listener
 *
 * @example <caption>Create and register a command using a responder</caption>
 * bot.use(new Bot.Listener.Command({
 *     name: 'dice roller',
 *     trigger: 'roll a die',
 *     handler: new Bot.Responder.RandomMessage({
 *         messages: [
 *             '1', '2', '3', '4', '5', '6'
 *         ]
 *     })
 * }));
 *
 * @example <caption>Create and register a command using a handler function</caption>
 * bot.use(new Bot.Listener.Command({
 *     name: 'meaning of life',
 *     trigger: /what('?s| is) the meaning of life/i,
 *     handler: async message => {
 *         await bot.replyTo(message).with('42');
 *     }
 * }));
 */
class CommandListener extends Listener {

	/**
	 * Create a bot command.
	 * @param {Object} options - The command options. See {@link Listener}.
	 */
	constructor(options) {
		super(options);
		this.triggerTypes = ['direct_mention', 'direct_message'];
	}

	/**
	 * Create a bot command (see {@link CommandListener} for parameters).
	 * @returns {CommandListener} The new command.
	 */
	static create(...args) {
		return new this(...args);
	}

}

module.exports = CommandListener;
