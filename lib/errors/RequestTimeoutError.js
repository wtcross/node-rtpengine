"use strict";

var util = require("util");

function RequestTimeoutError (cookie, retries) {
	this.cookie = cookie;
	this.retries = retries;
	this.name = "RequestTimeoutError";
	this.message = util.format("Request `%s` timeout after %s retries.", cookie, retries);
}

util.inherits(RequestTimeoutError, Error);

module.exports = RequestTimeoutError;
