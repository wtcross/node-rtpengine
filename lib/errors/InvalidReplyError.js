"use strict";

var util = require("util");

function InvalidReplyError (cookie, host, port) {
	this.name = "InvalidReplyError";
	this.message = util.format(
		"Invalid reply with cookie `%s` from host `%s` and port `%d`",
		cookie, host, port
	);
}

util.inherits(InvalidReplyError, Error);

module.exports = InvalidReplyError;
