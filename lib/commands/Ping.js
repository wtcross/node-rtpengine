"use strict";

var Util = require("util");

var Command = require("./Command");

var SCHEMA = require("../schemas/ping");

function Ping (options) {
	Command.call(this, SCHEMA, options);
}

Util.inherits(Ping, Command);

module.exports = Ping;
