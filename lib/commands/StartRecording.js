"use strict";

var Util = require("util");

var Command = require("./Command");

var SCHEMA = require("../schemas/start-recording");

function StartRecording (options) {
	Command.call(this, SCHEMA, options);
}

Util.inherits(StartRecording, Command);

module.exports = StartRecording;
