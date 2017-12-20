'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/data-manager', () => {
	let bindLogger;
	let Bot;
	let botkit;
	let DataManager;
	let defaults;
	let log;

	beforeEach(() => {

		bindLogger = require('../mock/bind-logger.mock');
		mockery.registerMock('./util/bind-logger', bindLogger);

		Bot = require('../mock/bot.mock');
		mockery.registerMock('./bot', Bot);

		botkit = require('../mock/botkit.mock');
		mockery.registerMock('./botkit', botkit);

		defaults = sinon.spy(require('lodash/defaults'));
		mockery.registerMock('lodash/defaults', defaults);

		log = require('../mock/log.mock');
		mockery.registerMock('./log', log);

		DataManager = require('../../../lib/data-manager');
	});

	it('exports a class constructor', () => {
		assert.isFunction(DataManager);
		assert.throws(DataManager, /class constructor/i);
	});

	describe('DataManager.defaults', () => {

		it('is an object', () => {
			assert.isObject(DataManager.defaults);
		});

	});

	describe('new DataManager(options)', () => {
		let instance;
		let options;

		beforeEach(() => {
			options = {
				example: 'mock-option'
			};
			instance = new DataManager(options);
		});

		it('defaults the options', () => {
			assert.calledOnce(defaults);
			assert.isObject(defaults.firstCall.args[0]);
			assert.strictEqual(defaults.firstCall.args[1], options);
			assert.strictEqual(defaults.firstCall.args[2], DataManager.defaults);
		});

		describe('.options', () => {
			it('is set to the defaulted options', () => {
				assert.strictEqual(instance.options, defaults.firstCall.returnValue);
			});
		});

		describe('.slackApi', () => {
			it('is set to `null`', () => {
				assert.isNull(instance.slackApi);
			});
		});

		describe('.registerToBot(bot)', () => {
			let mockBot;
			let returnValue;

			beforeEach(() => {
				mockBot = new Bot();
				mockBot.data = null;
				returnValue = instance.registerToBot(mockBot);
			});

			it('sets the instance `bot` property to the bot', () => {
				assert.strictEqual(instance.bot, mockBot);
			});

			it('binds the bot logger with the data manager class name', () => {
				assert.calledOnce(bindLogger);
				assert.calledWithExactly(bindLogger, mockBot.log, 'DataManager:');
			});

			it('sets the instance `log` property to the bound logger', () => {
				assert.strictEqual(instance.log, bindLogger.firstCall.returnValue);
			});

			it('adds the instance to the bot\'s data property', () => {
				assert.strictEqual(mockBot.data, instance);
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

		describe('.getChannels()', () => {
			let response1;
			let response2;
			let returnValue;

			beforeEach(async () => {
				response1 = {
					channels: [
						'mock-channel-1'
					],
					response_metadata: {
						next_cursor: 'mock-cursor'
					}
				};
				response2 = {
					channels: [
						'mock-channel-2'
					]
				};
				instance.log = log;
				instance.slackApi = botkit.mockBot.api;
				instance.slackApi.channels.list.onCall(0).yieldsAsync(null, response1);
				instance.slackApi.channels.list.onCall(1).yieldsAsync(null, response2);
				returnValue = await instance.getChannels();
			});

			it('calls the `channels.list` API method for each page of channels', () => {
				assert.calledTwice(instance.slackApi.channels.list);
				assert.deepEqual(instance.slackApi.channels.list.firstCall.args[0], {
					limit: 200,
					cursor: undefined
				});
				assert.deepEqual(instance.slackApi.channels.list.secondCall.args[0], {
					limit: 200,
					cursor: 'mock-cursor'
				});
			});

			it('resolves with the concatenated channels', () => {
				assert.deepEqual(returnValue, [
					'mock-channel-1',
					'mock-channel-2'
				]);
			});

			describe('when called a second time', () => {
				let secondReturnValue;

				beforeEach(async () => {
					instance.slackApi.channels.list.resetHistory();
					secondReturnValue = await instance.getChannels();
				});

				it('does not call the `channels.list` API method', () => {
					assert.notCalled(instance.slackApi.channels.list);
				});

				it('resolves with the channels from a cache', () => {
					assert.deepEqual(secondReturnValue, [
						'mock-channel-1',
						'mock-channel-2'
					]);
				});

			});

			describe('when the API call errors', () => {
				let apiError;
				let caughtError;

				beforeEach(async () => {
					delete instance.channelCache;
					apiError = new Error('mock api error');
					instance.slackApi.channels.list.reset();
					instance.slackApi.channels.list.yieldsAsync(apiError);
					try {
						returnValue = await instance.getChannels();
					} catch (error) {
						caughtError = error;
					}
				});

				it('rejects with a new error', () => {
					assert.instanceOf(caughtError, Error);
					assert.strictEqual(caughtError.message, 'Could not get channels from the Slack API: mock api error');
				});

			});

			describe('when the API response doesn\'t have users', () => {
				let caughtError;

				beforeEach(async () => {
					delete instance.channelCache;
					instance.slackApi.channels.list.reset();
					instance.slackApi.channels.list.yieldsAsync(null, {});
					try {
						returnValue = await instance.getChannels();
					} catch (error) {
						caughtError = error;
					}
				});

				it('rejects with a new error', () => {
					assert.instanceOf(caughtError, Error);
					assert.strictEqual(caughtError.message, 'Could not get channels from the Slack API: no channels');
				});

			});

		});

		describe('.getChannelsById()', () => {
			let channels;
			let returnValue;

			beforeEach(async () => {
				channels = [
					{
						id: 'mock-id-1',
						name: 'mock-name-1'
					},
					{
						id: 'mock-id-2',
						name: 'mock-name-2'
					}
				];
				instance.getChannels = sinon.stub().resolves(channels);
				returnValue = await instance.getChannelsById();
			});

			it('calls the `getChannels` method', () => {
				assert.calledOnce(instance.getChannels);
			});

			it('resolves with the channels indexed by ID', () => {
				assert.deepEqual(returnValue, {
					'mock-id-1': channels[0],
					'mock-id-2': channels[1]
				});
			});

			describe('when called a second time', () => {
				let secondReturnValue;

				beforeEach(async () => {
					instance.getChannels.resetHistory();
					secondReturnValue = await instance.getChannelsById();
				});

				it('does not call the `getChannels` method', () => {
					assert.notCalled(instance.getChannels);
				});

				it('resolves with the channels from a cache', () => {
					assert.strictEqual(returnValue, secondReturnValue);
				});

			});

		});

		describe('.getChannelById(channelId)', () => {
			let returnValue;
			let channelsById;

			beforeEach(async () => {
				channelsById = {
					'mock-id-1': 'mock-channel-1',
					'mock-id-2': 'mock-channel-2'
				};
				instance.getChannelsById = sinon.stub().resolves(channelsById);
				returnValue = await instance.getChannelById('mock-id-2');
			});

			it('calls the `getChannelsById` method', () => {
				assert.calledOnce(instance.getChannelsById);
			});

			it('resolves with the channel that has the specified ID', () => {
				assert.strictEqual(returnValue, 'mock-channel-2');
			});

			describe('when the specified channel does not exist', () => {

				beforeEach(async () => {
					returnValue = await instance.getChannelById('mock-id-3');
				});

				it('resolves with `null`', () => {
					assert.isNull(returnValue);
				});

			});

		});

		describe('.getUsers()', () => {
			let response1;
			let response2;
			let returnValue;

			beforeEach(async () => {
				response1 = {
					members: [
						'mock-user-1'
					],
					response_metadata: {
						next_cursor: 'mock-cursor'
					}
				};
				response2 = {
					members: [
						'mock-user-2'
					]
				};
				instance.log = log;
				instance.slackApi = botkit.mockBot.api;
				instance.slackApi.users.list.onCall(0).yieldsAsync(null, response1);
				instance.slackApi.users.list.onCall(1).yieldsAsync(null, response2);
				returnValue = await instance.getUsers();
			});

			it('calls the `users.list` API method for each page of users', () => {
				assert.calledTwice(instance.slackApi.users.list);
				assert.deepEqual(instance.slackApi.users.list.firstCall.args[0], {
					limit: 200,
					cursor: undefined
				});
				assert.deepEqual(instance.slackApi.users.list.secondCall.args[0], {
					limit: 200,
					cursor: 'mock-cursor'
				});
			});

			it('resolves with the concatenated users', () => {
				assert.deepEqual(returnValue, [
					'mock-user-1',
					'mock-user-2'
				]);
			});

			describe('when called a second time', () => {
				let secondReturnValue;

				beforeEach(async () => {
					instance.slackApi.users.list.resetHistory();
					secondReturnValue = await instance.getUsers();
				});

				it('does not call the `users.list` API method', () => {
					assert.notCalled(instance.slackApi.users.list);
				});

				it('resolves with the users from a cache', () => {
					assert.deepEqual(secondReturnValue, [
						'mock-user-1',
						'mock-user-2'
					]);
				});

			});

			describe('when the API call errors', () => {
				let apiError;
				let caughtError;

				beforeEach(async () => {
					delete instance.userCache;
					apiError = new Error('mock api error');
					instance.slackApi.users.list.reset();
					instance.slackApi.users.list.yieldsAsync(apiError);
					try {
						returnValue = await instance.getUsers();
					} catch (error) {
						caughtError = error;
					}
				});

				it('rejects with a new error', () => {
					assert.instanceOf(caughtError, Error);
					assert.strictEqual(caughtError.message, 'Could not get users from the Slack API: mock api error');
				});

			});

			describe('when the API response doesn\'t have users', () => {
				let caughtError;

				beforeEach(async () => {
					delete instance.userCache;
					instance.slackApi.users.list.reset();
					instance.slackApi.users.list.yieldsAsync(null, {});
					try {
						returnValue = await instance.getUsers();
					} catch (error) {
						caughtError = error;
					}
				});

				it('rejects with a new error', () => {
					assert.instanceOf(caughtError, Error);
					assert.strictEqual(caughtError.message, 'Could not get users from the Slack API: no users');
				});

			});

		});

		describe('.getUsersById()', () => {
			let returnValue;
			let users;

			beforeEach(async () => {
				users = [
					{
						id: 'mock-id-1',
						name: 'mock-name-1'
					},
					{
						id: 'mock-id-2',
						name: 'mock-name-2'
					}
				];
				instance.getUsers = sinon.stub().resolves(users);
				returnValue = await instance.getUsersById();
			});

			it('calls the `getUsers` method', () => {
				assert.calledOnce(instance.getUsers);
			});

			it('resolves with the users indexed by ID', () => {
				assert.deepEqual(returnValue, {
					'mock-id-1': users[0],
					'mock-id-2': users[1]
				});
			});

			describe('when called a second time', () => {
				let secondReturnValue;

				beforeEach(async () => {
					instance.getUsers.resetHistory();
					secondReturnValue = await instance.getUsersById();
				});

				it('does not call the `getUsers` method', () => {
					assert.notCalled(instance.getUsers);
				});

				it('resolves with the users from a cache', () => {
					assert.strictEqual(returnValue, secondReturnValue);
				});

			});

		});

		describe('.getUserById(userId)', () => {
			let returnValue;
			let usersById;

			beforeEach(async () => {
				usersById = {
					'mock-id-1': 'mock-user-1',
					'mock-id-2': 'mock-user-2'
				};
				instance.getUsersById = sinon.stub().resolves(usersById);
				returnValue = await instance.getUserById('mock-id-2');
			});

			it('calls the `getUsersById` method', () => {
				assert.calledOnce(instance.getUsersById);
			});

			it('resolves with the user that has the specified ID', () => {
				assert.strictEqual(returnValue, 'mock-user-2');
			});

			describe('when the specified user does not exist', () => {

				beforeEach(async () => {
					returnValue = await instance.getUserById('mock-id-3');
				});

				it('resolves with `null`', () => {
					assert.isNull(returnValue);
				});

			});

		});

		describe('.clearCaches()', () => {
			let returnValue;

			beforeEach(async () => {
				instance.channelCache = 'mock cache';
				instance.channelsByIdCache = 'mock cache';
				instance.userCache = 'mock cache';
				instance.usersByIdCache = 'mock cache';
				returnValue = await instance.clearCaches();
			});

			it('removes all object caches from the bot', () => {
				assert.isUndefined(instance.channelCache);
				assert.isUndefined(instance.channelsByIdCache);
				assert.isUndefined(instance.userCache);
				assert.isUndefined(instance.usersByIdCache);
			});

			it('returns `true`', () => {
				assert.isTrue(returnValue);
			});

		});

		describe('.valueOf()', () => {
			let returnValue;

			beforeEach(() => {
				returnValue = instance.valueOf();
			});

			it('returns a string representation of the instance', () => {
				assert.strictEqual(returnValue, '[object DataManager]');
			});

		});

		describe('.toJSON()', () => {
			let returnValue;

			beforeEach(() => {
				returnValue = instance.toJSON();
			});

			it('returns a plain object representation of the instance', () => {
				assert.deepEqual(returnValue, {});
			});

		});

		describe('.inspect()', () => {
			let returnValue;

			beforeEach(() => {
				returnValue = instance.inspect();
			});

			it('returns a string representation of the instance', () => {
				assert.strictEqual(returnValue, 'DataManager {}');
			});

		});

	});

	describe('DataManager.create(options)', () => {

		it('returns an instance of DataManager', () => {
			const options = {
				example: 'mock-option'
			};
			assert.instanceOf(DataManager.create(options), DataManager);
		});

	});

});
