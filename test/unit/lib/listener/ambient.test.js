'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/listener/ambient', () => {
	let AmbientListener;
	let Listener;

	beforeEach(() => {

		Listener = require('../../mock/listener.mock');
		mockery.registerMock('../listener', Listener);

		AmbientListener = require('../../../../lib/listener/ambient');
	});

	it('exports a class constructor', () => {
		assert.isFunction(AmbientListener);
		assert.throws(AmbientListener, /class constructor/i);
	});

	describe('new AmbientListener(options)', () => {
		let instance;
		let options;

		beforeEach(() => {
			options = {
				name: 'mock-name',
				trigger: 'mock-trigger',
				handler: sinon.stub()
			};
			instance = new AmbientListener(options);
		});

		it('extends Listener', () => {
			assert.instanceOf(instance, Listener);
		});

		describe('.triggerTypes', () => {
			it('is set to an array containing "ambient"', () => {
				assert.deepEqual(instance.triggerTypes, ['ambient']);
			});
		});

	});

	describe('AmbientListener.create(options)', () => {

		it('returns an instance of AmbientListener', () => {
			const options = {
				name: 'mock-name',
				trigger: 'mock-trigger',
				handler: sinon.stub()
			};
			assert.instanceOf(AmbientListener.create(options), AmbientListener);
		});

	});

});
