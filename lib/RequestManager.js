"use strict";

var Bencode  = require("bencode");
var Bluebird = require("bluebird");

var InvalidReplyError   = require("./errors/InvalidReplyError");

function RequestManager (socket, remotePort, remoteHost) {
	// Map<cookie, wait>
	var waits = {};

	function messageListener (message, rinfo) {
		// TODO: handle error cases
		//         - message doesn't match
		//         - bencode decode fails (reject for cookie)
		//         - reply from invalid host or port
		message = message.toString();

		var parts = message.match(/^(\S+)\s(.*)$/);

		// If the message matches then continue, otherwise ignore it.
		if (parts) {
			var cookie = parts[1];
			var wait   = waits[cookie];
			var payload;

			try {
				payload = Bencode.decode(parts[2], "utf8");
			}
			catch (error) {
				if (wait) {
					wait.reject(new InvalidReplyError (cookie, rinfo.host, rinfo.port));
				}
			}

			if (wait) {
				if (rinfo.address === remoteHost && rinfo.port === remotePort) {
					wait.resolve(payload);
				}
				else {
					wait.reject(new InvalidReplyError (cookie, rinfo.host, rinfo.port));
				}
			}
		}
	}

	socket.on("message", messageListener);

	this.createWait = function (cookie) {
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

module.exports = RequestManager;
