'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/alias', () => {
	let Alias;
	let bindLogger;
	let Bot;
	let defaults;

	beforeEach(() => {

		bindLogger = require('../mock/bind-logger.mock');
		mockery.registerMock('./util/bind-logger', bindLogger);

		Bot = require('../mock/bot.mock');
		mockery.registerMock('./bot', Bot);

		defaults = sinon.spy(require('lodash/defaults'));
		mockery.registerMock('lodash/defaults', defaults);

		Alias = require('../../../lib/alias');
	});

	it('exports a class constructor', () => {
		assert.isFunction(Alias);
		assert.throws(Alias, /class constructor/i);
	});

	describe('Alias.defaults', () => {

		it('is an object', () => {
			assert.isObject(Alias.defaults);
		});

		it('has an `avatar` property', () => {
			assert.strictEqual(Alias.defaults.avatar, ':grey_question:');
		});

	});

	describe('new Alias(options)', () => {
		let instance;
		let options;

		beforeEach(() => {
			options = {
				name: 'mock-name'
			};
			instance = new Alias(options);
		});

		it('defaults the options', () => {
			assert.calledOnce(defaults);
			assert.isObject(defaults.firstCall.args[0]);
			assert.strictEqual(defaults.firstCall.args[1], options);
			assert.strictEqual(defaults.firstCall.args[2], Alias.defaults);
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

		describe('.avatar', () => {

			it('is set to the default avatar', () => {
				assert.strictEqual(instance.avatar, Alias.defaults.avatar);
			});

			describe('when `options.avatar` is a URL', () => {

				beforeEach(() => {
					options.avatar = 'https://mock/avatar.png';
					instance = new Alias(options);
				});

				it('is set to `options.avatar`', () => {
					assert.strictEqual(instance.avatar, options.avatar);
				});

			});

			describe('when `options.avatar` is an emoji name (with colons)', () => {

				beforeEach(() => {
					options.avatar = ':mock-avatar:';
					instance = new Alias(options);
				});

				it('is set to `options.avatar`', () => {
					assert.strictEqual(instance.avatar, options.avatar);
				});

			});

			describe('when `options.avatar` is an emoji name (with no colons)', () => {

				beforeEach(() => {
					options.avatar = 'mock-avatar';
					instance = new Alias(options);
				});

				it('is set to the emoji name with colons', () => {
					assert.strictEqual(instance.avatar, ':mock-avatar:');
				});

			});

		});

		describe('.avatarType', () => {

			it('is set to "emoji"', () => {
				assert.strictEqual(instance.avatarType, 'emoji');
			});

			describe('when `options.avatar` is a URL', () => {

				beforeEach(() => {
					options.avatar = 'https://mock/avatar.png';
					instance = new Alias(options);
				});

				it('is set to "url"', () => {
					assert.strictEqual(instance.avatarType, 'url');
				});

			});

			describe('when `options.avatar` is an emoji name (with colons)', () => {

				beforeEach(() => {
					options.avatar = ':mock-avatar:';
					instance = new Alias(options);
				});

				it('is set to "emoji"', () => {
					assert.strictEqual(instance.avatarType, 'emoji');
				});

			});

			describe('when `options.avatar` is an emoji name (with no colons)', () => {

				beforeEach(() => {
					options.avatar = 'mock-avatar';
					instance = new Alias(options);
				});

				it('is set to "emoji"', () => {
					assert.strictEqual(instance.avatarType, 'emoji');
				});

			});

		});

		describe('.composeMessage()', () => {
			let returnValue;

			beforeEach(() => {
				instance.avatarType = 'mockType';
				returnValue = instance.composeMessage();
			});

			it('returns a Slack message with username and icon properties', () => {
				assert.deepEqual(returnValue, {
					username: instance.name,
					icon_mockType: instance.avatar
				});
			});

		});

		describe('.registerToBot(bot)', () => {
			let mockBot;
			let returnValue;

			beforeEach(() => {
				mockBot = new Bot();
				mockBot.alias = {};
				returnValue = instance.registerToBot(mockBot);
			});

			it('sets the instance `bot` property to the bot', () => {
				assert.strictEqual(instance.bot, mockBot);
			});

			it('binds the bot logger with the name of the alias', () => {
				assert.calledOnce(bindLogger);
				assert.calledWithExactly(bindLogger, mockBot.log, 'Alias (mock-name):');
			});

			it('sets the instance `log` property to the bound logger', () => {
				assert.strictEqual(instance.log, bindLogger.firstCall.returnValue);
			});

			it('adds the instance to the bot\'s alias property', () => {
				assert.strictEqual(mockBot.alias['mock-name'], instance);
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

		describe('.valueOf()', () => {
			let returnValue;

			beforeEach(() => {
				returnValue = instance.valueOf();
			});

			it('returns a string representation of the instance', () => {
				assert.strictEqual(returnValue, '[object Alias]');
			});

		});

		describe('.toJSON()', () => {
			let returnValue;

			beforeEach(() => {
				returnValue = instance.toJSON();
			});

			it('returns a plain object representation of the instance', () => {
				assert.deepEqual(returnValue, {
					name: instance.name,
					avatar: instance.avatar
				});
			});

		});

		describe('.inspect()', () => {
			let returnValue;

			beforeEach(() => {
				returnValue = instance.inspect();
			});

			it('returns a string representation of the instance', () => {
				assert.strictEqual(returnValue, 'Alias { \'mock-name\' }');
			});

		});

		describe('when `options.name` is not set', () => {
			it('throws an error', () => {
				delete options.name;
				assert.throws(() => new Alias(options), 'Alias name must be set');
			});
		});

		describe('when `options.avatar` is invalid', () => {
			it('throws an error', () => {
				options.avatar = '::::';
				assert.throws(() => new Alias(options), 'Alias avatar must be a URL or emoji name');
			});
		});

	});

	describe('Alias.create(options)', () => {

		it('returns an instance of Alias', () => {
			const options = {
				name: 'mock-name'
			};
			assert.instanceOf(Alias.create(options), Alias);
		});

	});

});
