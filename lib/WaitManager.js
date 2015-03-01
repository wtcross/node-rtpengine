"use strict";

var Bencode  = require("bencode");
var Bluebird = require("bluebird");

var InvalidReplyError   = require("./errors/InvalidReplyError");

function WaitManager (socket, remotePort, remoteHost) {
	var waits = {};

	function checkWaits (message, rinfo) {
		// Drop messages that aren't from the remote host.
		if (rinfo.address !== remoteHost || rinfo.port !== remotePort) {
			return;
		}

		// Parse the message.
		var parts = message.toString().match(/^(\S+)\s(.*)$/);

		// If well formed then continue processing.
		if (parts) {
			var cookie = parts[1];
			var wait   = waits[cookie];
			var payload;

			// If we aren't waiting on requests for this cookie then drop this message.
			if (!wait) {
				return;
			}

			try {
				// Attempt to decode the payload.
				payload = Bencode.decode(parts[2], "utf8");
				wait.resolve(payload);
			}
			catch (error) {
				// This shouldn't happen, but could if API changes on rtpengine end.
				wait.reject(new InvalidReplyError (cookie, rinfo.host, rinfo.port));
			}
		}
	}

	socket.on("message", checkWaits);

	this.wait = function (cookie) {
		var resolve;
		var reject;
		var promise = new Bluebird(function () {
			resolve = arguments[0];
			reject = arguments[1];
		});

		var wait = {
			promise : promise,
			resolve : resolve,
			reject  : reject,
			cookie  : cookie
		};

		waits[cookie] = wait;

		return Bluebird.resolve(wait)
		.disposer(function (wait) {
			delete waits[wait.cookie];
		});
	};
}

module.exports = WaitManager;
