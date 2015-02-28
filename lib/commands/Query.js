"use strict";

var Util = require("util");

var Command = require("./Command");

var SCHEMA = require("../schemas/query");

function Query (options) {
	Command.call(this, SCHEMA, options);
}

Util.inherits(Query, Command);

module.exports = Query;
