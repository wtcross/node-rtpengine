"use strict";

var Util = require("util");

var Command = require("./Command");

var SCHEMA = require("../schemas/offer");

function Offer (options) {
	Command.call(this, SCHEMA, options);
}

Util.inherits(Offer, Command);

module.exports = Offer;
