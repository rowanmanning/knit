'use strict';

const bindLogger = require('./util/bind-logger');
const defaults = require('lodash/defaults');
const pick = require('lodash/pick');
const Responder = require('./responder');
let Bot; // Not set here to get around circular dependency

/**
 * Class representing a bot listener.
 */
class Listener {

	/**
	 * Create a bot listener.
	 * @param {Object} options - The listener options.
	 * @param {String} options.name - The listener name, used in documentation.
	 * @param {(Array|RegExp|String)} [options.trigger] - The patterns which trigger the listener as
	 * a string, regular expression, or an array of them. When not defined, all messages will
	 * trigger the handler.
	 * @param {(Function|Responder)} options.handler - The handler for the listener.
	 * @throws {TypeError} Will throw if the name option is not set.
	 * @throws {TypeError} Will throw if the trigger option is invalid.
	 * @throws {TypeError} Will throw if the handler option is not set.
	 */
	constructor(options) {
		if (this.constructor === Listener) {
			throw new Error('You cannot create an instance of Listener, it is designed to be extended');
		}

		this.options = defaults({}, options, Listener.defaults);

		// Validate the name option
		this.name = this.options.name;
		if (!this.name) {
			throw new TypeError(`${this.constructor.name} name must be set`);
		}

		// Validate the trigger option
		this.trigger = this.options.trigger;
		if (typeof this.trigger !== 'string' && !(this.trigger instanceof RegExp) && !Array.isArray(this.trigger)) {
			throw new TypeError(`${this.constructor.name} trigger must be a string, array, or regular expression`);
		}
		this.triggerTypes = null;

		// Validate the handler option
		this.handler = this.options.handler;
		if (typeof this.handler !== 'function' && !(this.handler instanceof Responder)) {
			throw new TypeError(`${this.constructor.name} handler must be a function or Responder instance`);
		}

	}

	/**
	 * Register the listener to a bot.
	 * @access private
	 * @param {Bot} bot - The bot to register to.
	 * @returns {Listener} The calling listener instance.
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
		bot.listeners.push(this);

		if (this.handler instanceof Responder) {
			this.handler.registerToBot(bot);
		}

		this.log = bindLogger(bot.log, `${this.constructor.name} (${this.name}):`);
		this.log.info('Registered to bot');

		bot.botkit.controller.hears(
			this.trigger,
			this.triggerTypes,
			this.handleMessage.bind(this)
		);

		return this;
	}

	/**
	 * Handle a Slack message.
	 * @access private
	 * @param {Object} botkitBot - A botkit bot that can be used to respond to the message.
	 * @param {Object} message - A Slack message to handle.
	 * @returns {Undefined} No return value.
	 */
	handleMessage(botkitBot, message) {
		if (this.handler instanceof Responder) {
			this.handler.respond(message);
		} else {
			this.handler(message);
		}
	}

	/**
	 * Get the listener as a string, for use in implicit type conversion.
	 * @access private
	 * @returns {String} The string representation.
	 */
	valueOf() {
		return `[object ${this.constructor.name}]`;
	}

	/**
	 * Get the listener as a plain object, for use in JSON conversion.
	 * @access private
	 * @returns {Object} The listener as a plain object.
	 */
	toJSON() {
		return pick(this, [
			'name'
		]);
	}

	/**
	 * Get console-friendly representation of the listener.
	 * @access private
	 * @returns {String} The console-friendly representation.
	 */
	inspect() {
		return `${this.constructor.name} { '${this.name}' }`;
	}

}

/**
 * The default options used when constructing a listener.
 * @static
 */
Listener.defaults = {};

module.exports = Listener;
