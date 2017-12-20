'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/responder/random-message', () => {
	let log;
	let RandomMessageResponder;
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

		RandomMessageResponder = require('../../../../lib/responder/random-message');
	});

	it('exports a class constructor', () => {
		assert.isFunction(RandomMessageResponder);
		assert.throws(RandomMessageResponder, /class constructor/i);
	});

	describe('new RandomMessageResponder(options)', () => {
		let instance;
		let options;

		beforeEach(() => {
			options = {
				messages: [
					'mock-outgoing-message-1',
					'mock-outgoing-message-2'
				]
			};
			instance = new RandomMessageResponder(options);
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
				sample.returns('mock-sampled-message');
				response = Response.create();
				response.with.resolves('mock-with-return');
				Responder.prototype.respond = sinon.stub().returns(response);
				returnValue = await instance.respond(message);
			});

			it('gets a random message', () => {
				assert.calledOnce(sample);
				assert.calledWithExactly(sample, options.messages);
			});

			it('calls the `super.respond` method with `message`', () => {
				assert.calledOnce(Responder.prototype.respond);
				assert.calledWithExactly(Responder.prototype.respond, message);
			});

			it('calls the `with` method of the returned response with the randomly selected message', () => {
				assert.calledOnce(response.with);
				assert.calledWithExactly(response.with, 'mock-sampled-message');
			});

			it('resolves with the return value of the `with` call', () => {
				assert.strictEqual(returnValue, 'mock-with-return');
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

		describe('when `options.messages` is invalid', () => {
			it('throws an error', () => {
				options.messages = [null, []];
				assert.throws(() => new RandomMessageResponder(options), 'RandomMessageResponder messages must be an array of strings or objects');
				delete options.messages;
				assert.throws(() => new RandomMessageResponder(options), 'RandomMessageResponder messages must be an array');
			});
		});

	});

	describe('RandomMessageResponder.create(options)', () => {

		it('returns an instance of RandomMessageResponder', () => {
			const options = {
				messages: [
					'mock-outgoing-message-1',
					'mock-outgoing-message-2'
				]
			};
			assert.instanceOf(RandomMessageResponder.create(options), RandomMessageResponder);
		});

	});

});
