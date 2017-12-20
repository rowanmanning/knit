'use strict';

const Responder = require('../responder');

/**
 * Class representing a bot image responder. Image responders always reply
 * with the same image as a Slack attachment.
 * @extends Responder
 *
 * @example <caption>Create an image responder</caption>
 * new Bot.Responder.Image({
 *     image: 'https://i.imgur.com/ydM3Wb4.gif'
 * });
 *
 * @example <caption>Create an image responder with an alias and additional configurations</caption>
 * new Bot.Responder.Image({
 *     alias: 'GoatBot',
 *     image: 'https://i.imgur.com/ydM3Wb4.gif',
 *     label: 'Some cute goats',
 *     color: '#ffced8'
 * });
 */
class ImageResponder extends Responder {

	/**
	 * Create a bot image responder.
	 * @param {Object} options - The responder options.
	 * @param {String} options.image - The URL of the image to respond with.
	 * @param {String} [options.label] - Text to show alongside the image.
	 * @param {String} [options.color] - The color of the image attachment, a hex code including the preceeding "#".
	 * @param {(String|Alias)} [options.alias] - The alias to respond with. This must be either an {@link Alias} or the name of one registered the bot.
	 */
	constructor(options) {
		super(options);
		if (typeof options.image !== 'string') {
			throw new TypeError(`${this.constructor.name} image must be a string`);
		}
		if (options.label && typeof options.label !== 'string') {
			throw new TypeError(`${this.constructor.name} label must be a string`);
		}
		if (options.color && typeof options.color !== 'string') {
			throw new TypeError(`${this.constructor.name} color must be a string`);
		}
	}

	/**
	 * Respond to an incoming message with the responder message.
	 * @param {Object} message - The Slack message to respond to.
	 * @returns {Promise} A promise which resolves when the message is sent.
	 */
	async respond(message) {
		try {
			const imageAttachment = {
				/* eslint-disable camelcase */
				image_url: this.options.image,
				/* eslint-enable camelcase */
				fallback: this.options.image
			};
			if (this.options.color) {
				imageAttachment.color = this.options.color;
			}
			if (this.options.label) {
				imageAttachment.text = this.options.label;
				imageAttachment.fallback = `${this.options.label} ${this.options.image}`;
			}
			return await super.respond(message).with({
				attachments: [imageAttachment]
			});
		} catch (error) {
			this.log.error(`Error: ${error.message}`);
		}
	}

	/**
	 * Create a bot message responder (see {@link ImageResponder} for parameters).
	 * @returns {ImageResponder} The new message responder.
	 */
	static create(...args) {
		return new this(...args);
	}

}

module.exports = ImageResponder;
