'use strict';

const sinon = require('sinon');

const botkit = module.exports = {
	slackbot: sinon.stub()
};

const mockController = botkit.mockController = {
	hears: sinon.stub(),
	spawn: sinon.stub()
};

const mockBot = botkit.mockBot = {
	reply: sinon.stub().yieldsAsync(),
	startRTM: sinon.stub().yieldsAsync(),
	api: {
		channels: {
			list: sinon.stub().yieldsAsync()
		},
		users: {
			list: sinon.stub().yieldsAsync()
		}
	}
};

botkit.mockMessage = {
	isMockMessage: true
};

botkit.slackbot.returns(mockController);
mockController.spawn.returns(mockBot);
