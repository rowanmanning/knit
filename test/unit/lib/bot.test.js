'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/bot', () => {
	let Alias;
	let bindLogger;
	let Bot;
	let botkit;
	let DataManager;
	let defaults;
	let Listener;
	let log;
	let Response;

	beforeEach(() => {

		Alias = require('../mock/alias.mock');
		mockery.registerMock('./alias', Alias);

		bindLogger = require('../mock/bind-logger.mock');
		mockery.registerMock('./util/bind-logger', bindLogger);

		botkit = require('../mock/botkit.mock');
		mockery.registerMock('botkit', botkit);

		DataManager = require('../mock/data-manager.mock');
		mockery.registerMock('./data-manager', DataManager);

		defaults = sinon.spy(require('lodash/defaults'));
		mockery.registerMock('lodash/defaults', defaults);

		Listener = require('../mock/listener.mock');
		mockery.registerMock('./listener', Listener);

		log = require('../mock/log.mock');
		mockery.registerMock('log', log);

		Response = require('../mock/response.mock');
		mockery.registerMock('./response', Response);

		Bot = require('../../../lib/bot');
	});

	it('exports a class constructor', () => {
		assert.isFunction(Bot);
		assert.throws(Bot, /class constructor/i);
	});

	describe('Bot.defaults', () => {

		it('is an object', () => {
			assert.isObject(Bot.defaults);
		});

		it('has an `includeBotkitLogs` property', () => {
			assert.isFalse(Bot.defaults.includeBotkitLogs);
		});

		it('has an `includeBotkitDebugLogs` property', () => {
			assert.isFalse(Bot.defaults.includeBotkitDebugLogs);
		});

		it('has a `log` property', () => {
			assert.strictEqual(Bot.defaults.log, console);
		});

	});

	describe('new Bot(options)', () => {
		let instance;
		let options;

		beforeEach(() => {
			options = {
				log,
				name: 'mock-name',
				slackToken: 'mock-slack-token'
			};
			instance = new Bot(options);
		});

		it('defaults the options', () => {
			assert.calledOnce(defaults);
			assert.isObject(defaults.firstCall.args[0]);
			assert.strictEqual(defaults.firstCall.args[1], options);
			assert.strictEqual(defaults.firstCall.args[2], Bot.defaults);
		});

		it('binds the logger option with the name of the bot', () => {
			assert.calledOnce(bindLogger);
			assert.calledWithExactly(bindLogger, options.log, 'mock-name:');
		});

		it('creates a botkit slackbot controller and stores it in a property', () => {
			assert.calledOnce(botkit.slackbot);
			assert.isObject(botkit.slackbot.firstCall.args[0]);
			/* eslint-disable camelcase */
			assert.isTrue(botkit.slackbot.firstCall.args[0].disable_startup_messages);
			/* eslint-enable camelcase */
			assert.isObject(botkit.slackbot.firstCall.args[0].logger);
			assert.isFunction(botkit.slackbot.firstCall.args[0].logger.log);
		});

		it('creates a data manager and registers it', () => {
			assert.calledOnce(DataManager.create);
			assert.calledWithExactly(DataManager.create);
			assert.calledOnce(DataManager.create.firstCall.returnValue.registerToBot);
			assert.calledWithExactly(DataManager.create.firstCall.returnValue.registerToBot, instance);
		});

		describe('botkit controller logger', () => {
			let logger;

			beforeEach(() => {
				logger = botkit.slackbot.firstCall.args[0].logger.log;
				logger('mock-type', 1, 2, 3);
			});

			it('does nothing', () => {
				// To get coverage in case of default options
				assert.isTrue(true);
			});

			describe('when `options.includeBotkitLogs` is `true`', () => {

				beforeEach(() => {
					botkit.slackbot.resetHistory();
					options.includeBotkitLogs = true;
					instance = new Bot(options);
					logger = botkit.slackbot.firstCall.args[0].logger.log;
					logger('mock-type', 1, 2, 3);
				});

				it('logs the message with a prefix', () => {
					assert.calledWith(instance.log.info, 'Botkit [mock-type]:', 1, 2, 3);
				});

			});

			describe('when `options.includeBotkitLogs` is `true` and the message is a debug log', () => {

				beforeEach(() => {
					botkit.slackbot.resetHistory();
					options.includeBotkitLogs = true;
					instance = new Bot(options);
					logger = botkit.slackbot.firstCall.args[0].logger.log;
					logger('debug', 1, 2, 3);
				});

				it('does not log the message', () => {
					assert.neverCalledWith(instance.log.info, 'Botkit [debug]:', 1, 2, 3);
				});

			});

			describe('when `options.includeBotkitDebugLogs` is `true` and the message is a debug log', () => {

				beforeEach(() => {
					botkit.slackbot.resetHistory();
					options.includeBotkitLogs = true;
					options.includeBotkitDebugLogs = true;
					instance = new Bot(options);
					logger = botkit.slackbot.firstCall.args[0].logger.log;
					logger('debug', 1, 2, 3);
				});

				it('logs the message with a prefix', () => {
					assert.calledWith(instance.log.info, 'Botkit [debug]:', 1, 2, 3);
				});

			});

		});

		it('creates a botkit bot and stores it in a property', () => {
			assert.calledOnce(botkit.mockController.spawn);
			assert.calledWith(botkit.mockController.spawn, {
				token: options.slackToken
			});
		});

		describe('.options', () => {
			it('is set to the defaulted options', () => {
				assert.strictEqual(instance.options, defaults.firstCall.returnValue);
			});
		});

		describe('.botkit', () => {

			it('is an object', () => {
				assert.isObject(instance.botkit);
			});

			describe('.controller', () => {
				it('is set to the created botkit controller', () => {
					assert.strictEqual(instance.botkit.controller, botkit.mockController);
				});
			});

			describe('.bot', () => {
				it('is set to the created botkit bot', () => {
					assert.strictEqual(instance.botkit.bot, botkit.mockBot);
				});
			});

		});

		describe('.log', () => {
			it('is set to the return value of the log binding', () => {
				assert.strictEqual(instance.log, bindLogger.firstCall.returnValue);
			});
		});

		describe('.name', () => {
			it('is set to `options.name`', () => {
				assert.strictEqual(instance.name, options.name);
			});
		});

		describe('.listeners', () => {
			it('is set to an empty array', () => {
				assert.deepEqual(instance.listeners, []);
			});
		});

		describe('.alias', () => {
			it('is set to an empty object', () => {
				assert.deepEqual(instance.alias, {});
			});
		});

		describe('.use(extension)', () => {
			let extension;
			let mockReturnValue;
			let returnValue;

			describe('when `extension` is an instance of Alias', () => {

				beforeEach(() => {
					mockReturnValue = {};
					extension = sinon.createStubInstance(Alias);
					extension.registerToBot.returns(mockReturnValue);
					returnValue = instance.use(extension);
				});

				it('registers the alias to the bot', () => {
					assert.calledOnce(extension.registerToBot);
					assert.calledWithExactly(extension.registerToBot, instance);
				});

				it('returns the result of the registration', () => {
					assert.strictEqual(returnValue, mockReturnValue);
				});

			});

			describe('when `extension` is an instance of Listener', () => {

				beforeEach(() => {
					mockReturnValue = {};
					extension = sinon.createStubInstance(Listener);
					extension.registerToBot.returns(mockReturnValue);
					returnValue = instance.use(extension);
				});

				it('registers the alias to the bot', () => {
					assert.calledOnce(extension.registerToBot);
					assert.calledWithExactly(extension.registerToBot, instance);
				});

				it('returns the result of the registration', () => {
					assert.strictEqual(returnValue, mockReturnValue);
				});

			});

			describe('when `extension` is a function', () => {

				beforeEach(() => {
					mockReturnValue = {};
					extension = sinon.stub().returns(mockReturnValue);
					returnValue = instance.use(extension);
				});

				it('calls the functon with the bot', () => {
					assert.calledOnce(extension);
					assert.calledWithExactly(extension, instance);
				});

				it('returns the result of the call', () => {
					assert.strictEqual(returnValue, mockReturnValue);
				});

			});

			describe('when `extension` is a string', () => {

				beforeEach(() => {
					mockReturnValue = 'mock-return';
					extension = sinon.stub().returns(mockReturnValue);
					mockery.registerMock('mock-module', extension);
					sinon.spy(instance, 'use');
					returnValue = instance.use('mock-module');
				});

				it('calls `use` again with the `extension` required as a module', () => {
					assert.calledTwice(instance.use);
					assert.calledWith(instance.use.secondCall, extension);
				});

				it('returns the result of second `use` call', () => {
					assert.strictEqual(returnValue, mockReturnValue);
				});

			});

			describe('when `extension` is invalid', () => {
				it('throws an error', () => {
					assert.throws(() => instance.use(123), 'Bot extension cannot be of type "number"');
				});
			});

		});

		describe('.replyTo(incomingMessage)', () => {
			let mockSlackMessage;
			let returnValue;

			beforeEach(() => {
				mockSlackMessage = {};
				returnValue = instance.replyTo(mockSlackMessage);
			});

			it('creates an instance of Response passing in the bot', () => {
				assert.calledOnce(Response.create);
				assert.calledWithExactly(Response.create, instance);
			});

			it('returns the created instance', () => {
				assert.instanceOf(returnValue, Response);
			});

			it('sets the response incoming message to `incomingMessage`', () => {
				assert.calledOnce(returnValue.to);
				assert.calledWithExactly(returnValue.to, mockSlackMessage);
			});

		});

		describe('.connect()', () => {
			let returnValue;

			beforeEach(async () => {
				returnValue = await instance.connect();
			});

			it('starts the bot', () => {
				assert.calledOnce(botkit.mockBot.startRTM);
			});

			it('resolves with nothing', () => {
				assert.isUndefined(returnValue);
			});

			describe('when the bot errors', () => {
				let caughtError;

				beforeEach(async () => {
					botkit.mockBot.startRTM.yieldsAsync('mock-error');
					try {
						await instance.connect();
					} catch (error) {
						caughtError = error;
					}
				});

				it('throws an error', () => {
					assert.instanceOf(caughtError, Error);
					assert.strictEqual(caughtError.message, 'Bot could not connect to Slack: mock-error');
				});

			});

		});

		describe('.valueOf()', () => {
			let returnValue;

			beforeEach(() => {
				returnValue = instance.valueOf();
			});

			it('returns a string representation of the instance', () => {
				assert.strictEqual(returnValue, '[object Bot]');
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
				assert.strictEqual(returnValue, 'Bot { \'mock-name\' }');
			});

		});

		describe('when `options.name` is not set', () => {
			it('throws an error', () => {
				delete options.name;
				assert.throws(() => new Bot(options), 'Bot name must be set');
			});
		});

		describe('when `options.slackToken` is not set', () => {
			it('throws an error', () => {
				delete options.slackToken;
				assert.throws(() => new Bot(options), 'Bot slackToken must be set');
			});
		});

	});

});
