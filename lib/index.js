'use strict';

// Aliases to all of the classes in the library

/**
 * The main entry point for the module.
 * @module @rowanmanning/knit
 * @see Bot
 */

const Bot = require('./bot');

/**
 * @name Bot.Alias
 * @see Alias
 * @static
 */
Bot.Alias = require('./alias');

/**
 * @name Bot.Listener
 * @see Listener
 * @static
 */
Bot.Listener = require('./listener');

/**
 * @name Listener.Ambient
 * @see AmbientListener
 * @static
 */
Bot.Listener.Ambient = require('./listener/ambient');

/**
 * @name Listener.Command
 * @see CommandListener
 * @static
 */
Bot.Listener.Command = require('./listener/command');

/**
 * @name Bot.Responder
 * @see Responder
 * @static
 */
Bot.Responder = require('./responder');

/**
 * @name Responder.Image
 * @see ImageResponder
 * @static
 */
Bot.Responder.Image = require('./responder/image');

/**
 * @name Responder.Message
 * @see MessageResponder
 * @static
 */
Bot.Responder.Message = require('./responder/message');

/**
 * @name Responder.RandomImage
 * @see RandomImageResponder
 * @static
 */
Bot.Responder.RandomImage = require('./responder/random-image');

/**
 * @name Responder.RandomMessage
 * @see RandomMessageResponder
 * @static
 */
Bot.Responder.RandomMessage = require('./responder/random-message');

/**
 * @name Bot.Response
 * @see Response
 * @static
 */
Bot.Response = require('./response');

module.exports = Bot;
