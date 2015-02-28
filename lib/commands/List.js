"use strict";

var Util = require("util");

var Command = require("./Command");

var SCHEMA = require("../schemas/list");

function List (options) {
	Command.call(this, SCHEMA, options);
}

Util.inherits(List, Command);

module.exports = List;
