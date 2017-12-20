'use strict';

const isPlainObject = require('lodash/isPlainObject');
const Responder = require('../responder');
const sample = require('lodash/sample');

/**
 * Class representing a bot random image responder. Random image responders
 * always reply with a randomly selected image from a list, as a Slack attachment.
 * @extends Responder
 *
 * @example <caption>Create a random image responder</caption>
 * new Bot.Responder.RandomImage({
 *     images: [
 *         'https://i.imgur.com/ydM3Wb4.gif',
 *         'https://media.giphy.com/media/XdACBmg3lx6RG/giphy.gif'
 *     ]
 * });
 *
 * @example <caption>Create a random image responder with additional configurations</caption>
 * new Bot.Responder.RandomImage({
 *     images: [
 *         {
 *             image: 'https://i.imgur.com/ydM3Wb4.gif',
 *             label: 'Some cute goats'
 *         },
 *         {
 *             image: 'https://media.giphy.com/media/XdACBmg3lx6RG/giphy.gif',
 *             label: 'A goat with ice-skating skills'
 *         }
 *     ]
 * });
 *
 * @example <caption>Create a random image responder with a default label/color</caption>
 * new Bot.Responder.RandomImage({
 *     label: 'Have a goat',
 *     color: '#ffced8',
 *     images: [
 *         'https://i.imgur.com/ydM3Wb4.gif',
 *         'https://media.giphy.com/media/XdACBmg3lx6RG/giphy.gif'
 *     ]
 * });
 */
class RandomImageResponder extends Responder {

	/**
	 * Create a bot random image responder.
	 * @param {Object} options - The responder options.
	 * @param {(String[]|Object[])} options.images - The images to respond with, one will be randomly picked each time.
	 * @param {String} [options.label] - Default text to show alongside images.
	 * @param {String} [options.color] - Default color of the image attachment, a hex code including the preceeding "#".
	 * @param {(String|Alias)} [options.alias] - The alias to respond with. This must be either an {@link Alias} or the name of one registered the bot.
	 */
	constructor(options) {
		super(options);
		if (options.label && typeof options.label !== 'string') {
			throw new TypeError(`${this.constructor.name} label must be a string`);
		}
		if (options.color && typeof options.color !== 'string') {
			throw new TypeError(`${this.constructor.name} color must be a string`);
		}
		if (!Array.isArray(options.images)) {
			throw new TypeError(`${this.constructor.name} images must be an array`);
		}
		for (const image of options.images) {
			if (typeof image !== 'string' && !isPlainObject(image)) {
				throw new TypeError(`${this.constructor.name} images must be an array of strings or objects`);
			}
			if (typeof image !== 'string') {
				if (typeof image.image !== 'string') {
					throw new TypeError(`${this.constructor.name} each image object image must be a string`);
				}
				if (image.label && typeof image.label !== 'string') {
					throw new TypeError(`${this.constructor.name} each image object label must be a string`);
				}
				if (image.color && typeof image.color !== 'string') {
					throw new TypeError(`${this.constructor.name} each image object color must be a string`);
				}
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
			let image = sample(this.options.images);
			if (typeof image === 'string') {
				image = {image};
			}
			const imageAttachment = {
				/* eslint-disable camelcase */
				image_url: image.image,
				/* eslint-enable camelcase */
				fallback: image.image
			};
			if (image.color) {
				imageAttachment.color = image.color;
			} else if (this.options.color) {
				imageAttachment.color = this.options.color;
			}
			if (image.label) {
				imageAttachment.text = image.label;
				imageAttachment.fallback = `${image.label} ${image.image}`;
			} else if (this.options.label) {
				imageAttachment.text = this.options.label;
				imageAttachment.fallback = `${this.options.label} ${image.image}`;
			}
			return await super.respond(message).with({
				attachments: [imageAttachment]
			});

		} catch (error) {
			this.log.error(`Error: ${error.message}`);
		}
	}

	/**
	 * Create a bot random image responder (see {@link RandomImageResponder} for parameters).
	 * @returns {RandomImageResponder} The new random image responder.
	 */
	static create(...args) {
		return new this(...args);
	}

}

module.exports = RandomImageResponder;
