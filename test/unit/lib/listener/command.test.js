'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/listener/command', () => {
	let CommandListener;
	let Listener;

	beforeEach(() => {

		Listener = require('../../mock/listener.mock');
		mockery.registerMock('../listener', Listener);

		CommandListener = require('../../../../lib/listener/command');
	});

	it('exports a class constructor', () => {
		assert.isFunction(CommandListener);
		assert.throws(CommandListener, /class constructor/i);
	});

	describe('new CommandListener(options)', () => {
		let instance;
		let options;

		beforeEach(() => {
			options = {
				name: 'mock-name',
				trigger: 'mock-trigger',
				handler: sinon.stub()
			};
			instance = new CommandListener(options);
		});

		it('extends Listener', () => {
			assert.instanceOf(instance, Listener);
		});

		describe('.triggerTypes', () => {
			it('is set to an array containing "direct_mention" and "direct_message"', () => {
				assert.deepEqual(instance.triggerTypes, ['direct_mention', 'direct_message']);
			});
		});

	});

	describe('CommandListener.create(options)', () => {

		it('returns an instance of CommandListener', () => {
			const options = {
				name: 'mock-name',
				trigger: 'mock-trigger',
				handler: sinon.stub()
			};
			assert.instanceOf(CommandListener.create(options), CommandListener);
		});

	});

});
