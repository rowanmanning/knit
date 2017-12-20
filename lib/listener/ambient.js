'use strict';

const Listener = require('../listener');

/**
 * Class representing a bot ambient listener. Ambient listeners can be
 * used to respond to user messages or act on certain trigger phrases
 * being mentioned. Ambient listeners can make use of regular methods,
 * or {@link Responder}s
 * @extends Listener
 *
 * @example <caption>Create and register a listener using a responder</caption>
 * bot.use(new Bot.Listener.Ambient({
 *     name: 'hunger listener',
 *     trigger: /i'?m hungry/i,
 *     handler: new Bot.Responder.Message({
 *         message: `Hello hungry, I'm ${bot.name}`
 *     })
 * }));
 *
 * @example <caption>Create and register a listener using a handler function</caption>
 * bot.use(new Bot.Listener.Ambient({
 *     name: 'help listener',
 *     trigger: 'HELP!',
 *     handler: async message => {
 *         await bot.replyTo(message).with('What do you need help with?');
 *     }
 * }));
 */
class AmbientListener extends Listener {

	/**
	 * Create a bot ambient listener.
	 * @param {Object} options - The ambient listener options. See {@link Listener}.
	 */
	constructor(options) {
		super(options);
		this.triggerTypes = ['ambient'];
	}

	/**
	 * Create a bot ambient listener (see {@link AmbientListener} for parameters).
	 * @returns {AmbientListener} The new ambient listener.
	 */
	static create(...args) {
		return new this(...args);
	}

}

module.exports = AmbientListener;
