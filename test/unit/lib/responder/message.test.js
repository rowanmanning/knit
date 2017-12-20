'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/responder/message', () => {
	let log;
	let MessageResponder;
	let Responder;
	let Response;

	beforeEach(() => {

		log = require('../../mock/log.mock');

		Responder = require('../../mock/responder.mock');
		mockery.registerMock('../responder', Responder);

		Response = require('../../mock/response.mock');
		mockery.registerMock('../response', Response);

		MessageResponder = require('../../../../lib/responder/message');
	});

	it('exports a class constructor', () => {
		assert.isFunction(MessageResponder);
		assert.throws(MessageResponder, /class constructor/i);
	});

	describe('new MessageResponder(options)', () => {
		let instance;
		let options;

		beforeEach(() => {
			options = {
				message: 'mock-outgoing-message'
			};
			instance = new MessageResponder(options);
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

			it('calls the `with` method of the returned response with the instance message', () => {
				assert.calledOnce(response.with);
				assert.calledWithExactly(response.with, options.message);
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

		describe('when `options.message` is invalid', () => {
			it('throws an error', () => {
				delete options.message;
				assert.throws(() => new MessageResponder(options), 'MessageResponder message must be a string or object');
			});
		});

	});

	describe('MessageResponder.create(options)', () => {

		it('returns an instance of MessageResponder', () => {
			const options = {
				message: 'mock-outgoing-message'
			};
			assert.instanceOf(MessageResponder.create(options), MessageResponder);
		});

	});

});
