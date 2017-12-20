'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/listener', () => {
	let Listener;
	let bindLogger;
	let Bot;
	let botkit;
	let defaults;
	let Responder;

	beforeEach(() => {

		bindLogger = require('../mock/bind-logger.mock');
		mockery.registerMock('./util/bind-logger', bindLogger);

		Bot = require('../mock/bot.mock');
		mockery.registerMock('./bot', Bot);

		botkit = require('../mock/botkit.mock');
		mockery.registerMock('botkit', botkit);

		defaults = sinon.spy(require('lodash/defaults'));
		mockery.registerMock('lodash/defaults', defaults);

		Responder = require('../mock/responder.mock');
		mockery.registerMock('./responder', Responder);

		Listener = require('../../../lib/listener');
	});

	it('exports a class constructor', () => {
		assert.isFunction(Listener);
		assert.throws(Listener, /class constructor/i);
	});

	describe('Listener.defaults', () => {

		it('is an object', () => {
			assert.isObject(Listener.defaults);
		});

	});

	describe('new Listener(options)', () => {
		it('throws an error', () => {
			assert.throws(() => new Listener({}), 'You cannot create an instance of Listener, it is designed to be extended');
		});
	});

	describe('new ExtendedListener(options)', () => {
		let ExtendedListener;
		let instance;
		let options;

		beforeEach(() => {
			ExtendedListener = class ExtendedListener extends Listener {};

			options = {
				name: 'mock-name',
				trigger: 'mock-trigger',
				handler: sinon.stub()
			};
			instance = new ExtendedListener(options);
		});

		it('defaults the options', () => {
			assert.calledOnce(defaults);
			assert.isObject(defaults.firstCall.args[0]);
			assert.strictEqual(defaults.firstCall.args[1], options);
			assert.strictEqual(defaults.firstCall.args[2], Listener.defaults);
		});

		describe('.options', () => {
			it('is set to the defaulted options', () => {
				assert.strictEqual(instance.options, defaults.firstCall.returnValue);
			});
		});

		describe('.name', () => {
			it('is set to `options.name`', () => {
				assert.strictEqual(instance.name, options.name);
			});
		});

		describe('.trigger', () => {
			it('is set to `options.trigger`', () => {
				assert.strictEqual(instance.trigger, options.trigger);
			});
		});

		describe('.triggerTypes', () => {
			it('is null', () => {
				assert.isNull(instance.triggerTypes);
			});
		});

		describe('.handler', () => {
			it('is set to `options.handler`', () => {
				assert.strictEqual(instance.handler, options.handler);
			});
		});

		describe('.registerToBot(bot)', () => {
			let boundHandleMessage;
			let mockBot;
			let returnValue;

			beforeEach(() => {
				mockBot = new Bot();
				boundHandleMessage = sinon.stub();
				instance.handleMessage.bind = sinon.stub().returns(boundHandleMessage);
				instance.triggerTypes = ['mock-trigger-type'];
				returnValue = instance.registerToBot(mockBot);
			});

			it('sets the instance `bot` property to the bot', () => {
				assert.strictEqual(instance.bot, mockBot);
			});

			it('binds the bot logger with the name of the listener', () => {
				assert.calledOnce(bindLogger);
				assert.calledWithExactly(bindLogger, mockBot.log, 'ExtendedListener (mock-name):');
			});

			it('sets the instance `log` property to the bound logger', () => {
				assert.strictEqual(instance.log, bindLogger.firstCall.returnValue);
			});

			it('adds the instance to the bot\'s listeners property', () => {
				assert.deepEqual(mockBot.listeners, [instance]);
			});

			it('binds `handleMessage` to the controller', () => {
				assert.calledOnce(instance.handleMessage.bind);
				assert.calledWithExactly(instance.handleMessage.bind, instance);
			});

			it('adds a listener to the botkit controller for the expected trigger', () => {
				assert.calledOnce(mockBot.botkit.controller.hears);
				assert.calledWith(
					mockBot.botkit.controller.hears,
					instance.trigger,
					['mock-trigger-type'],
					boundHandleMessage
				);
			});

			it('returns the instance', () => {
				assert.strictEqual(returnValue, instance);
			});

			describe('when the listener `handler` is an instance of Responder', () => {

				beforeEach(() => {
					instance.handler = new Responder();
					instance.handler.registerToBot = sinon.stub().returns(instance.handler);
					returnValue = instance.registerToBot(mockBot);
				});

				it('registers the responder to the bot', () => {
					assert.calledOnce(instance.handler.registerToBot);
					assert.calledWithExactly(instance.handler.registerToBot, mockBot);
				});

			});

			describe('when `bot` is not an instance of Bot', () => {
				it('throws an error', () => {
					assert.throws(() => instance.registerToBot({}), 'Expected an instance of Bot');
				});
			});

		});

		describe('.handleMessage(botkitBot, message)', () => {

			beforeEach(() => {
				instance.handleMessage(botkit.mockBot, botkit.mockMessage);
			});

			it('calls the handler with `message`', () => {
				assert.calledOnce(instance.handler);
				assert.calledWithExactly(instance.handler, botkit.mockMessage);
			});

			describe('when the listener `handler` is an instance of Responder', () => {

				beforeEach(() => {
					instance.handler = new Responder();
					instance.handler.respond = sinon.stub();
					instance.handleMessage(botkit.mockBot, botkit.mockMessage);
				});

				it('calls the handler `respond` method with `message`', () => {
					assert.calledOnce(instance.handler.respond);
					assert.calledWithExactly(instance.handler.respond, botkit.mockMessage);
				});

			});

		});

		describe('.valueOf()', () => {
			let returnValue;

			beforeEach(() => {
				returnValue = instance.valueOf();
			});

			it('returns a string representation of the instance', () => {
				assert.strictEqual(returnValue, '[object ExtendedListener]');
			});

		});

		describe('.toJSON()', () => {
			let returnValue;

			beforeEach(() => {
				returnValue = instance.toJSON();
			});

			it('returns a plain object representation of the instance', () => {
				assert.deepEqual(returnValue, {
					name: instance.name
				});
			});

		});

		describe('.inspect()', () => {
			let returnValue;

			beforeEach(() => {
				returnValue = instance.inspect();
			});

			it('returns a string representation of the instance', () => {
				assert.strictEqual(returnValue, 'ExtendedListener { \'mock-name\' }');
			});

		});

		describe('when `options.name` is not set', () => {
			it('throws an error', () => {
				delete options.name;
				assert.throws(() => new ExtendedListener(options), 'ExtendedListener name must be set');
			});
		});

		describe('when `options.trigger` is invalid', () => {
			it('throws an error', () => {
				delete options.trigger;
				assert.throws(() => new ExtendedListener(options), 'ExtendedListener trigger must be a string, array, or regular expression');
			});
		});

		describe('when `options.handler` is invalid', () => {
			it('throws an error', () => {
				delete options.handler;
				assert.throws(() => new ExtendedListener(options), 'ExtendedListener handler must be a function or Responder instance');
			});
		});

	});

});
