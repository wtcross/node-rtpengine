"use strict";

var Util = require("util");

var Command = require("./Command");

var SCHEMA = require("../schemas/delete");

function Delete (options) {
	Command.call(this, SCHEMA, options);
}

Util.inherits(Delete, Command);

module.exports = Delete;
