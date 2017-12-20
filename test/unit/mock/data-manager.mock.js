'use strict';

const sinon = require('sinon');

class DataManager {

	registerToBot() {}

}

module.exports = DataManager;
module.exports.create = sinon.spy(() => {
	return sinon.createStubInstance(DataManager);
});
