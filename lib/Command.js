"use strict";

var Bencode = require("bencode");
var Joi     = require("joi");
var _       = require("lodash");

var InvalidCommandError = require("./errors/InvalidCommandError");

function Command (schema, options) {
	var validated = Joi.validate(options, schema);

	if (validated.error) {
		throw new InvalidCommandError(validated.error.message);
	}

	_.assign(this, validated.value);
	Object.freeze(this);
}

Command.prototype.bencode = function () {
	return Bencode.encode(this);
};

module.exports = Command;
