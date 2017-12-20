'use strict';

const sinon = require('sinon');

const bindLogger = module.exports = sinon.stub();

const mockLogger = bindLogger.mockLogger = {
	error: sinon.spy(),
	info: sinon.spy()
};

bindLogger.returns(mockLogger);
