'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/responder/image', () => {
	let ImageResponder;
	let log;
	let Responder;
	let Response;

	beforeEach(() => {

		log = require('../../mock/log.mock');

		Responder = require('../../mock/responder.mock');
		mockery.registerMock('../responder', Responder);

		Response = require('../../mock/response.mock');
		mockery.registerMock('../response', Response);

		ImageResponder = require('../../../../lib/responder/image');
	});

	it('exports a class constructor', () => {
		assert.isFunction(ImageResponder);
		assert.throws(ImageResponder, /class constructor/i);
	});

	describe('new ImageResponder(options)', () => {
		let instance;
		let options;

		beforeEach(() => {
			options = {
				image: 'mock-image',
				label: 'mock-label',
				color: 'mock-color'
			};
			instance = new ImageResponder(options);
		});

		it('extends Responder', () => {
			assert.instanceOf(instance, Responder);
		});

		describe('.respond(message)', () => {
			let message;
			let response;
			let returnValue;

			beforeEach(async () => {
				message = {
					text: 'mock-incoming-message'
				};
				response = Response.create();
				response.with.resolves('mock-with-return');
				Responder.prototype.respond = sinon.stub().returns(response);
				returnValue = await instance.respond(message);
			});

			it('calls the `super.respond` method with `message`', () => {
				assert.calledOnce(Responder.prototype.respond);
				assert.calledWithExactly(Responder.prototype.respond, message);
			});

			it('calls the `with` method of the returned response with a Slack-formatted image message', () => {
				assert.calledOnce(response.with);
				assert.calledWith(response.with, {
					attachments: [
						{
							image_url: 'mock-image',
							fallback: 'mock-label mock-image',
							color: 'mock-color',
							text: 'mock-label'
						}
					]
				});
			});

			it('resolves with the return value of the `with` call', () => {
				assert.strictEqual(returnValue, 'mock-with-return');
			});

			describe('when `options.label` is not set', () => {
				it('does not include a label in the output', async () => {
					response.with.reset();
					delete instance.options.label;
					await instance.respond(message);
					assert.calledOnce(response.with);
					assert.calledWith(response.with, {
						attachments: [
							{
								image_url: 'mock-image',
								fallback: 'mock-image',
								color: 'mock-color'
							}
						]
					});
				});
			});

			describe('when `options.color` is not set', () => {
				it('does not include a color in the output', async () => {
					response.with.reset();
					delete instance.options.color;
					await instance.respond(message);
					assert.calledOnce(response.with);
					assert.calledWith(response.with, {
						attachments: [
							{
								image_url: 'mock-image',
								fallback: 'mock-label mock-image',
								text: 'mock-label'
							}
						]
					});
				});
			});

			describe('when `with` errors', () => {
				it('does not throw an error, but logs it instead', async () => {
					instance.log = log;
					response.with.rejects(new Error('mock error'));
					await instance.respond(message);
					assert.calledOnce(log.error);
					assert.calledWithExactly(log.error, 'Error: mock error');
				});
			});

		});

		describe('when `options.image` is invalid', () => {
			it('throws an error', () => {
				delete options.image;
				assert.throws(() => new ImageResponder(options), 'ImageResponder image must be a string');
			});
		});

		describe('when `options.label` is invalid', () => {
			it('throws an error', () => {
				options.label = [];
				assert.throws(() => new ImageResponder(options), 'ImageResponder label must be a string');
				delete options.label;
				assert.doesNotThrow(() => new ImageResponder(options));
			});
		});

		describe('when `options.color` is invalid', () => {
			it('throws an error', () => {
				options.color = [];
				assert.throws(() => new ImageResponder(options), 'ImageResponder color must be a string');
				delete options.color;
				assert.doesNotThrow(() => new ImageResponder(options));
			});
		});

	});

	describe('ImageResponder.create(options)', () => {

		it('returns an instance of ImageResponder', () => {
			const options = {
				image: 'mock-image',
				label: 'mock-label',
				color: 'mock-color'
			};
			assert.instanceOf(ImageResponder.create(options), ImageResponder);
		});

	});

});
