'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/response', () => {
	let Alias;
	let Bot;
	let defaults;
	let Response;

	beforeEach(() => {

		Alias = require('../mock/alias.mock');
		mockery.registerMock('./alias', Alias);

		Bot = require('../mock/bot.mock');
		mockery.registerMock('./bot', Bot);

		defaults = sinon.spy(require('lodash/defaults'));
		mockery.registerMock('lodash/defaults', defaults);

		Response = require('../../../lib/response');
	});

	it('exports a class constructor', () => {
		assert.isFunction(Response);
		assert.throws(Response, /class constructor/i);
	});

	describe('new Response(bot)', () => {
		let bot;
		let instance;

		beforeEach(() => {
			bot = new Bot();
			instance = new Response(bot);
		});

		describe('.bot', () => {
			it('is set to `bot`', () => {
				assert.strictEqual(instance.bot, bot);
			});
		});

		describe('.message', () => {
			it('is set to an empty object', () => {
				assert.deepEqual(instance.message, {});
			});
		});

		describe('.to(incomingMessage)', () => {
			let incomingMessage;
			let returnValue;

			beforeEach(() => {
				incomingMessage = {
					text: 'mock-text',
					ts: 'mock-timestamp',
					user: 'mock-user'
				};
				returnValue = instance.to(incomingMessage);
			});

			it('sets the instance `incomingMessage` property to `incomingMessage`', () => {
				assert.strictEqual(instance.incomingMessage, incomingMessage);
			});

			it('returns the instance', () => {
				assert.strictEqual(returnValue, instance);
			});

			describe('when `incomingMessage` is not an object', () => {
				it('throws an error', () => {
					assert.throws(() => instance.to(null), 'Expected an object');
				});
			});

			describe('when `incomingMessage.text` is not a string', () => {
				it('throws an error', () => {
					delete incomingMessage.text;
					assert.throws(() => instance.to(incomingMessage), 'Expected a text property on Slack message');
				});
			});

			describe('when `incomingMessage.ts` is not a string', () => {
				it('throws an error', () => {
					delete incomingMessage.ts;
					assert.throws(() => instance.to(incomingMessage), 'Expected a ts property on Slack message');
				});
			});

			describe('when `incomingMessage.user` is not a string', () => {
				it('throws an error', () => {
					delete incomingMessage.user;
					assert.throws(() => instance.to(incomingMessage), 'Expected a user property on Slack message');
				});
			});

		});

		describe('.as(alias)', () => {
			let alias;
			let composedMessage;
			let existingMessage;
			let returnValue;

			beforeEach(() => {
				composedMessage = {
					isComposedMessage: true
				};
				existingMessage = instance.message = {
					isExistingMessage: true
				};
				alias = new Alias();
				alias.composeMessage = sinon.stub().returns(composedMessage);
				returnValue = instance.as(alias);
			});

			it('sets the instance `alias` property to `alias`', () => {
				assert.strictEqual(instance.alias, alias);
			});

			it('calls the alias `composeMessage` method', () => {
				assert.calledOnce(alias.composeMessage);
			});

			it('merges the composed message with the `message` property', () => {
				assert.calledOnce(defaults);
				assert.isObject(defaults.firstCall.args[0]);
				assert.strictEqual(defaults.firstCall.args[1], composedMessage);
				assert.strictEqual(defaults.firstCall.args[2], existingMessage);
			});

			it('sets the instance `message` property to the merged message', () => {
				assert.strictEqual(instance.message, defaults.firstCall.returnValue);
			});

			it('returns the instance', () => {
				assert.strictEqual(returnValue, instance);
			});

			describe('when `alias` is a string', () => {

				beforeEach(() => {
					composedMessage = {
						isComposedMessage: true
					};
					existingMessage = instance.message = {
						isExistingMessage: true
					};
					alias = bot.alias.MockAlias = new Alias();
					alias.composeMessage = sinon.stub().returns(composedMessage);
					returnValue = instance.as('MockAlias');
				});

				it('sets the instance `alias` property to the corresponding bot `alias`', () => {
					assert.strictEqual(instance.alias, alias);
				});

				it('returns the instance', () => {
					assert.strictEqual(returnValue, instance);
				});

			});

			describe('when `alias` is a string that does not map to a registered alias', () => {
				it('throws an error', () => {
					assert.throws(() => instance.as('MockAlias'), 'MockAlias is not the name of a registered alias');
				});
			});

			describe('when `alias` is not a string or a valid alias', () => {
				it('throws an error', () => {
					assert.throws(() => instance.as(), 'Expected a string or an instance of Alias');
				});
			});

		});

		describe('.with(outgoingMessage)', () => {
			let existingMessage;
			let incomingMessage;
			let outgoingMessage;
			let returnValue;
			let slackResponse;

			beforeEach(async () => {
				existingMessage = instance.message = {
					isExistingMessage: true
				};
				incomingMessage = instance.incomingMessage = {
					isIncomingMessage: true
				};
				outgoingMessage = {
					text: 'mock-message'
				};
				slackResponse = {
					isSlackResponse: true
				};
				bot.botkit.bot.reply.yieldsAsync(null, slackResponse);
				returnValue = await instance.with(outgoingMessage);
			});

			it('merges the outgoing message with the `message` property', () => {
				assert.calledOnce(defaults);
				assert.isObject(defaults.firstCall.args[0]);
				assert.strictEqual(defaults.firstCall.args[1], outgoingMessage);
				assert.strictEqual(defaults.firstCall.args[2], existingMessage);
			});

			it('sets the instance `message` property to the merged message', () => {
				assert.strictEqual(instance.message, defaults.firstCall.returnValue);
			});

			it('uses botkit to respond to the message', () => {
				assert.calledOnce(bot.botkit.bot.reply);
				assert.calledWith(bot.botkit.bot.reply, incomingMessage, instance.message);
			});

			it('resolves with the slack response', () => {
				assert.strictEqual(returnValue, slackResponse);
			});

			describe('when `outgoingMessage` is a string', () => {

				beforeEach(async () => {
					defaults.reset();
					returnValue = await instance.with('mock-message-string');
				});

				it('converts it to an object', () => {
					assert.deepEqual(defaults.firstCall.args[1], {
						text: 'mock-message-string'
					});
				});

			});

			describe('when `outgoingMessage` is not a string or an object', () => {
				it('throws an error', () => {
					assert.throws(() => instance.with(null), 'Expected an object');
				});
			});

			describe('when botkit fails to send the message', () => {

				beforeEach(() => {
					const botkitError = new Error('mock botkit error');
					bot.botkit.bot.reply.yieldsAsync(botkitError);
				});

				it('rejects with an error', async () => {
					let failing = true;
					try {
						await instance.with(outgoingMessage);
						failing = false;
					} catch (error) {
						assert.instanceOf(error, Error);
						assert.strictEqual(error.message, 'Bot could not send message to Slack: Error: mock botkit error');
					}
					if (!failing) {
						assert.fail('Instance did not error');
					}
				});

			});

		});

		describe('.valueOf()', () => {
			let returnValue;

			beforeEach(() => {
				instance.message = {
					text: 'mock-text'
				};
				returnValue = instance.valueOf();
			});

			it('returns a string representation of the instance', () => {
				assert.strictEqual(returnValue, 'mock-text');
			});

		});

		describe('.toJSON()', () => {
			let returnValue;

			beforeEach(() => {
				instance.message = {
					isMockMessage: true
				};
				returnValue = instance.toJSON();
			});

			it('returns a plain object representation of the response message', () => {
				assert.deepEqual(returnValue, instance.message);
			});

		});

		describe('.inspect()', () => {
			let returnValue;

			beforeEach(() => {
				instance.message = {
					text: 'mock-text'
				};
				returnValue = instance.inspect();
			});

			it('returns a string representation of the instance', () => {
				assert.strictEqual(returnValue, 'Response { \'mock-text\' }');
			});

		});

		describe('when `bot` is not an instance of Bot', () => {
			it('throws an error', () => {
				assert.throws(() => new Response({}), 'Expected an instance of Bot');
			});
		});

	});

	describe('Response.create(options)', () => {

		it('returns an instance of Response', () => {
			const bot = new Bot();
			assert.instanceOf(Response.create(bot), Response);
		});

	});

});
