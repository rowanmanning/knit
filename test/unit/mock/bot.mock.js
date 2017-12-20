'use strict';

const botkit = require('./botkit.mock');
const sinon = require('sinon');

class Bot {

	constructor() {
		this.alias = {};
		this.listeners = [];
		this.log = {
			error: sinon.spy(),
			info: sinon.spy()
		};
		this.botkit = {
			bot: botkit.mockBot,
			controller: botkit.mockController
		};
	}

	replyTo() {}

	use() {}

}

module.exports = Bot;
