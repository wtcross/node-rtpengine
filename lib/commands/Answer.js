"use strict";

var Util = require("util");

var Command = require("./Command");

var SCHEMA = require("../schemas/answer");

function Answer (options) {
	Command.call(this, SCHEMA, options);
}

Util.inherits(Answer, Command);

module.exports = Answer;
