'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/responder/random-image', () => {
	let log;
	let RandomImageResponder;
	let Responder;
	let Response;
	let sample;

	beforeEach(() => {

		log = require('../../mock/log.mock');

		Responder = require('../../mock/responder.mock');
		mockery.registerMock('../responder', Responder);

		Response = require('../../mock/response.mock');
		mockery.registerMock('../response', Response);

		sample = sinon.stub();
		mockery.registerMock('lodash/sample', sample);

		RandomImageResponder = require('../../../../lib/responder/random-image');
	});

	it('exports a class constructor', () => {
		assert.isFunction(RandomImageResponder);
		assert.throws(RandomImageResponder, /class constructor/i);
	});

	describe('new RandomImageResponder(options)', () => {
		let instance;
		let options;

		beforeEach(() => {
			options = {
				images: [
					'mock-outgoing-image-1',
					'mock-outgoing-image-2'
				]
			};
			instance = new RandomImageResponder(options);
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
					text: 'mock-incoming-image'
				};
				sample.returns('mock-image');
				response = Response.create();
				response.with.resolves('mock-with-return');
				Responder.prototype.respond = sinon.stub().returns(response);
				returnValue = await instance.respond(message);
			});

			it('gets a random image', () => {
				assert.calledOnce(sample);
				assert.calledWithExactly(sample, options.images);
			});

			it('calls the `super.respond` method with `message`', () => {
				assert.calledOnce(Responder.prototype.respond);
				assert.calledWithExactly(Responder.prototype.respond, message);
			});

			it('calls the `with` method of the returned response with a Slack-formatted image message with the randomly selected image', () => {
				assert.calledOnce(response.with);
				assert.calledWith(response.with, {
					attachments: [
						{
							image_url: 'mock-image',
							fallback: 'mock-image'
						}
					]
				});
			});

			it('resolves with the return value of the `with` call', () => {
				assert.strictEqual(returnValue, 'mock-with-return');
			});

			describe('when the sampled image is an object', () => {

				beforeEach(async () => {
					response.with.resetHistory();
					sample.returns({
						image: 'mock-image',
						label: 'mock-label',
						color: 'mock-color'
					});
					await instance.respond(message);
				});

				it('calls the `with` method of the returned response with a Slack-formatted image message with the randomly selected image', () => {
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

			});

			describe('when a default label and color are set', () => {

				beforeEach(async () => {
					response.with.resetHistory();
					instance.options.label = 'mock-default-label';
					instance.options.color = 'mock-default-color';
					sample.returns('mock-image');
					await instance.respond(message);
				});

				it('uses the defaults', () => {
					assert.calledOnce(response.with);
					assert.calledWith(response.with, {
						attachments: [
							{
								image_url: 'mock-image',
								fallback: 'mock-default-label mock-image',
								color: 'mock-default-color',
								text: 'mock-default-label'
							}
						]
					});
				});

			});

			describe('when a default label and color are set but the selected image has these properties', () => {

				beforeEach(async () => {
					response.with.resetHistory();
					instance.options.label = 'mock-default-label';
					instance.options.color = 'mock-default-color';
					sample.returns({
						image: 'mock-image',
						label: 'mock-label',
						color: 'mock-color'
					});
					await instance.respond(message);
				});

				it('uses the image properties rather than the defaults', () => {
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

		describe('when `options.images` is an array of objects', () => {
			it('does not throw an error', () => {
				options.images = [{
					image: 'mock-image'
				}];
				assert.doesNotThrow(() => new RandomImageResponder(options));
			});
		});

		describe('when `options.images` is not an array', () => {
			it('throws an error', () => {
				delete options.images;
				assert.throws(() => new RandomImageResponder(options), 'RandomImageResponder images must be an array');
			});
		});

		describe('when `options.images` is not an array of strings or objects', () => {
			it('throws an error', () => {
				options.images = [null, []];
				assert.throws(() => new RandomImageResponder(options), 'RandomImageResponder images must be an array of strings or objects');
			});
		});

		describe('when objects in `options.images` are invalid', () => {
			it('throws an error', () => {
				options.images = [
					{
						image: null
					}
				];
				assert.throws(() => new RandomImageResponder(options), 'RandomImageResponder each image object image must be a string');
				options.images = [
					{
						image: 'mock-image',
						label: []
					}
				];
				assert.throws(() => new RandomImageResponder(options), 'RandomImageResponder each image object label must be a string');
				options.images = [
					{
						image: 'mock-image',
						color: []
					}
				];
				assert.throws(() => new RandomImageResponder(options), 'RandomImageResponder each image object color must be a string');
			});
		});

		describe('when `options.label` is invalid', () => {
			it('throws an error', () => {
				options.label = [];
				assert.throws(() => new RandomImageResponder(options), 'RandomImageResponder label must be a string');
				delete options.label;
				assert.doesNotThrow(() => new RandomImageResponder(options));
			});
		});

		describe('when `options.color` is invalid', () => {
			it('throws an error', () => {
				options.color = [];
				assert.throws(() => new RandomImageResponder(options), 'RandomImageResponder color must be a string');
				delete options.color;
				assert.doesNotThrow(() => new RandomImageResponder(options));
			});
		});

	});

	describe('RandomImageResponder.create(options)', () => {

		it('returns an instance of RandomImageResponder', () => {
			const options = {
				images: [
					'mock-outgoing-image-1',
					'mock-outgoing-image-2'
				]
			};
			assert.instanceOf(RandomImageResponder.create(options), RandomImageResponder);
		});

	});

});
