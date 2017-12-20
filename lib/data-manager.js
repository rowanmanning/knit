'use strict';

const bindLogger = require('./util/bind-logger');
const defaults = require('lodash/defaults');
const keyBy = require('lodash/keyBy');
let Bot; // Not set here to get around circular dependency

/**
 * Class representing Slack and bot data.
 */
class DataManager {

	/**
	 * Create a data manager.
	 * @param {Object} options - The data manager options.
	 */
	constructor(options) {
		this.options = defaults({}, options, DataManager.defaults);
		this.slackApi = null;
	}

	/**
	 * Register the data manager to a bot.
	 * @access private
	 * @param {Bot} bot - The bot to register to.
	 * @returns {DataManager} The calling data manager instance.
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
		this.slackApi = bot.botkit.bot.api;
		bot.data = this;

		this.log = bindLogger(bot.log, `${this.constructor.name}:`);
		this.log.info('Registered to bot');

		return this;
	}

	/**
	 * Get all channels on the Slack instance.
	 * @returns {Promise} Returns a promise which resolves with an array of channels.
	 */
	async getChannels() {
		if (!this.channelCache) {

			let channels = [];
			let cursor;

			// Function to fetch a page of channels
			const fetchChannels = () => {
				return new Promise((resolve, reject) => {
					this.slackApi.channels.list({
						limit: 200,
						cursor
					}, (error, response) => {
						if (error || !response || !response.channels) {
							return reject(new Error(`Could not get channels from the Slack API: ${error ? error.message : 'no channels'}`));
						}
						resolve(response);
					});
				});
			};

			// We need to loop until we get all of the channels,
			// there's an explit break later to end this
			/* eslint-disable no-constant-condition */
			while (true) {
				/* eslint-enable no-constant-condition */

				const response = await fetchChannels(cursor);
				channels = channels.concat(response.channels);

				if (response.response_metadata && response.response_metadata.next_cursor) {
					cursor = response.response_metadata.next_cursor;
				} else {
					break;
				}
			}

			// Cache the channels
			this.channelCache = channels;
			this.log.info('Loaded and cached Slack channels');
		}

		// Resolve with the cached channels
		return this.channelCache;
	}

	/**
	 * Get all channels on the the Slack instance as an object with channel IDs as keys.
	 * @returns {Promise} Returns a promise which resolves with indexed channels.
	 */
	async getChannelsById() {
		if (!this.channelsByIdCache) {
			this.channelsByIdCache = keyBy(await this.getChannels(), 'id');
		}
		return this.channelsByIdCache;
	}

	/**
	 * Get a single channel on the Slack instance by ID.
	 * @param {String} channelId - The ID of the channel to get.
	 * @returns {Promise} Returns a promise which resolves with requested channel or `null` if one is not found.
	 */
	async getChannelById(channelId) {
		return (await this.getChannelsById())[channelId] || null;
	}

	/**
	 * Get all users who have access to the Slack instance.
	 * @returns {Promise} Returns a promise which resolves with an array of users.
	 */
	async getUsers() {
		if (!this.userCache) {

			let users = [];
			let cursor;

			// Function to fetch a page of users
			const fetchUsers = () => {
				return new Promise((resolve, reject) => {
					this.slackApi.users.list({
						limit: 200,
						cursor
					}, (error, response) => {
						if (error || !response || !response.members) {
							return reject(new Error(`Could not get users from the Slack API: ${error ? error.message : 'no users'}`));
						}
						resolve(response);
					});
				});
			};

			// We need to loop until we get all of the users,
			// there's an explit break later to end this
			/* eslint-disable no-constant-condition */
			while (true) {
				/* eslint-enable no-constant-condition */

				const response = await fetchUsers(cursor);
				users = users.concat(response.members);

				if (response.response_metadata && response.response_metadata.next_cursor) {
					cursor = response.response_metadata.next_cursor;
				} else {
					break;
				}
			}

			// Cache the users
			this.userCache = users;
			this.log.info('Loaded and cached Slack users');
		}

		// Resolve with the cached users
		return this.userCache;
	}

	/**
	 * Get all users who have access to the Slack instance as an object with user IDs as keys.
	 * @returns {Promise} Returns a promise which resolves with indexed users.
	 */
	async getUsersById() {
		if (!this.usersByIdCache) {
			this.usersByIdCache = keyBy(await this.getUsers(), 'id');
		}
		return this.usersByIdCache;
	}

	/**
	 * Get a single user who has access to the Slack instance by ID.
	 * @param {String} userId - The ID of the user to get.
	 * @returns {Promise} Returns a promise which resolves with requested user or `null` if one is not found.
	 */
	async getUserById(userId) {
		return (await this.getUsersById())[userId] || null;
	}

	/**
	 * Clear all object caches.
	 * @returns {Boolean} Returns `true` if the caches were purged.
	 */
	clearCaches() {
		delete this.channelCache;
		delete this.channelsByIdCache;
		delete this.userCache;
		delete this.usersByIdCache;
		return true;
	}

	/**
	 * Get the data manager as a string, for use in implicit type conversion.
	 * @access private
	 * @returns {String} The string representation.
	 */
	valueOf() {
		return `[object ${this.constructor.name}]`;
	}

	/**
	 * Get the data manager as a plain object, for use in JSON conversion.
	 * @access private
	 * @returns {Object} The data manager as a plain object.
	 */
	toJSON() {
		return {};
	}

	/**
	 * Get console-friendly representation of the data manager.
	 * @access private
	 * @returns {String} The console-friendly representation.
	 */
	inspect() {
		return `${this.constructor.name} {}`;
	}

	/**
	 * Create a data manager (see {@link DataManager} for parameters).
	 * @returns {DataManager} The new data manager.
	 */
	static create(...args) {
		return new this(...args);
	}

}

/**
 * The default options used when constructing a data manager.
 * @static
 */
DataManager.defaults = {};

module.exports = DataManager;
