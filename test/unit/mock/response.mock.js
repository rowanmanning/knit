'use strict';

const sinon = require('sinon');

class Response {

	to() {}

	as() {}

	with() {}

}

module.exports = Response;
module.exports.create = sinon.spy(() => {
	const mockInstance = sinon.createStubInstance(Response);
	mockInstance.to.returnsThis();
	mockInstance.as.returnsThis();
	return mockInstance;
});
