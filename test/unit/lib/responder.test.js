'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/responder', () => {
	let bindLogger;
	let Bot;
	let defaults;
	let Responder;
	let Response;

	beforeEach(() => {

		bindLogger = require('../mock/bind-logger.mock');
		mockery.registerMock('./util/bind-logger', bindLogger);

		Bot = require('../mock/bot.mock');
		mockery.registerMock('./bot', Bot);

		defaults = sinon.spy(require('lodash/defaults'));
		mockery.registerMock('lodash/defaults', defaults);

		Response = require('../mock/response.mock');
		mockery.registerMock('./response', Response);

		Responder = require('../../../lib/responder');
	});

	it('exports a class constructor', () => {
		assert.isFunction(Responder);
		assert.throws(Responder, /class constructor/i);
	});

	describe('Responder.defaults', () => {

		it('is an object', () => {
			assert.isObject(Responder.defaults);
		});

	});

	describe('new Responder(options)', () => {
		it('throws an error', () => {
			assert.throws(() => new Responder({}), 'You cannot create an instance of Responder, it is designed to be extended');
		});
	});

	describe('new ExtendedResponder(options)', () => {
		let ExtendedResponder;
		let instance;
		let options;

		beforeEach(() => {
			ExtendedResponder = class ExtendedResponder extends Responder {};

			options = {
				example: 'mock-option'
			};
			instance = new ExtendedResponder(options);
		});

		it('defaults the options', () => {
			assert.calledOnce(defaults);
			assert.isObject(defaults.firstCall.args[0]);
			assert.strictEqual(defaults.firstCall.args[1], options);
			assert.strictEqual(defaults.firstCall.args[2], Responder.defaults);
		});

		describe('.options', () => {
			it('is set to the defaulted options', () => {
				assert.strictEqual(instance.options, defaults.firstCall.returnValue);
			});
		});

		describe('.registerToBot(bot)', () => {
			let mockBot;
			let returnValue;

			beforeEach(() => {
				mockBot = new Bot();
				returnValue = instance.registerToBot(mockBot);
			});

			it('sets the instance `bot` property to the bot', () => {
				assert.strictEqual(instance.bot, mockBot);
			});

			it('binds the bot logger with the name of the responder', () => {
				assert.calledOnce(bindLogger);
				assert.calledWithExactly(bindLogger, mockBot.log, 'ExtendedResponder:');
			});

			it('sets the instance `log` property to the bound logger', () => {
				assert.strictEqual(instance.log, bindLogger.firstCall.returnValue);
			});

			it('returns the instance', () => {
				assert.strictEqual(returnValue, instance);
			});

			describe('when `bot` is not an instance of Bot', () => {
				it('throws an error', () => {
					assert.throws(() => instance.registerToBot({}), 'Expected an instance of Bot');
				});
			});

		});

		describe('.respond(message)', () => {
			let response;
			let returnValue;

			beforeEach(() => {
				response = Response.create();
				instance.bot = new Bot();
				instance.bot.replyTo = sinon.stub().returns(response);
				returnValue = instance.respond(Bot.mockMessage);
			});

			it('creates a response', () => {
				assert.calledOnce(instance.bot.replyTo);
				assert.calledWithExactly(instance.bot.replyTo, Bot.mockMessage);
			});

			it('returns the response', () => {
				assert.strictEqual(returnValue, response);
			});

			describe('when `options.alias` is set', () => {

				beforeEach(() => {
					instance.options.alias = 'mock-alias';
					returnValue = instance.respond(Bot.mockMessage);
				});

				it('sets an alias on the response', () => {
					assert.calledOnce(response.as);
					assert.calledWithExactly(response.as, instance.options.alias);
				});

			});

		});

		describe('.valueOf()', () => {
			let returnValue;

			beforeEach(() => {
				returnValue = instance.valueOf();
			});

			it('returns a string representation of the instance', () => {
				assert.strictEqual(returnValue, '[object ExtendedResponder]');
			});

		});

		describe('.toJSON()', () => {
			let returnValue;

			beforeEach(() => {
				returnValue = instance.toJSON();
			});

			it('returns a plain object representation of the instance', () => {
				assert.deepEqual(returnValue, options);
			});

		});

		describe('.inspect()', () => {
			let returnValue;

			beforeEach(() => {
				returnValue = instance.inspect();
			});

			it('returns a string representation of the instance', () => {
				assert.strictEqual(returnValue, 'ExtendedResponder {}');
			});

		});

	});

});
