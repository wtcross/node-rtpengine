"use strict";

var util = require("util");

function InvalidCommandError (message) {
	this.name = "InvalidCommandError";
	this.message = message;
}

util.inherits(InvalidCommandError, Error);

module.exports = InvalidCommandError;
