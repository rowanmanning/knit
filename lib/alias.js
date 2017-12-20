'use strict';

const bindLogger = require('./util/bind-logger');
const defaults = require('lodash/defaults');
const pick = require('lodash/pick');
let Bot; // Not set here to get around circular dependency

/**
 * Class representing a bot alias. Aliases are used to identify the
 * bot as a different user in Slack by setting a custom name and avatar.
 *
 * @example <caption>Create and register an alias</caption>
 * bot.use(new Bot.Alias({
 *     name: 'DiceBot',
 *     avatar: 'game_die' // An emoji name or image URL
 * }));
 *
 * @example <caption>Use an alias as part of a {@link Responder}</caption>
 * bot.use(new Bot.Listener.Command({
 *     name: 'dice roller',
 *     trigger: 'roll a die',
 *     handler: new Bot.Responder.RandomMessage({
 *         alias: 'DiceBot',
 *         messages: [
 *             '1', '2', '3', '4', '5', '6'
 *         ]
 *     })
 * }));
 *
 * @example <caption>Use an alias as part of a handler function</caption>
 * bot.use(new Bot.Listener.Ambient({
 *     name: 'hunger listener',
 *     trigger: /i'?m hungry/i,
 *     handler: async message => {
 *         await bot
 *             .replyTo(message)
 *             .as('HungerBot')
 *             .with(`Hello hungry, I'm ${bot.name}`);
 *     }
 * }));
 */
class Alias {

	/**
	 * Create a bot alias.
	 * @param {Object} options - The alias options.
	 * @param {String} options.name - The name to give the bot when using this alias.
	 * @param {String} [options.avatar] - Either an emoji name or URL of an image to use as a bot avatar.
	 * @throws {TypeError} Will throw if the name option is not set.
	 * @throws {TypeError} Will throw if the avatar option is invalid.
	 */
	constructor(options) {
		this.options = defaults({}, options, Alias.defaults);

		// Validate the name option
		this.name = this.options.name;
		if (!this.name) {
			throw new TypeError('Alias name must be set');
		}

		// Validate the avatar option
		const avatarMatch = this.options.avatar.match(/^(https?:\/\/.+)|(:?([^:]+):?)$/i);
		if (avatarMatch && avatarMatch[1]) {
			this.avatar = avatarMatch[1];
			this.avatarType = 'url';
		} else if (avatarMatch && avatarMatch[3]) {
			this.avatar = `:${avatarMatch[3]}:`;
			this.avatarType = 'emoji';
		} else {
			throw new TypeError('Alias avatar must be a URL or emoji name');
		}
	}

	/**
	 * Compose a Slack message which includes the username and icon properties for this alias.
	 * @returns {Object} The composed Slack message.
	 */
	composeMessage() {
		return {
			username: this.name,
			[`icon_${this.avatarType}`]: this.avatar
		};
	}

	/**
	 * Register the alias to a bot.
	 * @access private
	 * @param {Bot} bot - The bot to register to.
	 * @returns {Alias} The calling alias instance.
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
		bot.alias[this.name] = this;

		this.log = bindLogger(bot.log, `${this.constructor.name} (${this.name}):`);
		this.log.info('Registered to bot');

		return this;
	}

	/**
	 * Get the alias as a string, for use in implicit type conversion.
	 * @access private
	 * @returns {String} The string representation.
	 */
	valueOf() {
		return `[object ${this.constructor.name}]`;
	}

	/**
	 * Get the alias as a plain object, for use in JSON conversion.
	 * @access private
	 * @returns {Object} The alias as a plain object.
	 */
	toJSON() {
		return pick(this, [
			'avatar',
			'name'
		]);
	}

	/**
	 * Get console-friendly representation of the alias.
	 * @access private
	 * @returns {String} The console-friendly representation.
	 */
	inspect() {
		return `${this.constructor.name} { '${this.name}' }`;
	}

	/**
	 * Create a bot alias (see {@link Alias} for parameters).
	 * @returns {Alias} The new alias.
	 */
	static create(...args) {
		return new this(...args);
	}

}

/**
 * The default options used when constructing an alias.
 * @static
 */
Alias.defaults = {
	avatar: ':grey_question:'
};

module.exports = Alias;
