"use strict";

const Bencode  = require("bencode");
const Bluebird = require("bluebird");

const InvalidReplyError   = require("./errors/InvalidReplyError");

function WaitManager (socket, remotePort, remoteHost) {
	const waits = {};

	function checkWaits (message, rinfo) {
		// Drop messages that aren't from the remote host. FIXME: handle this more proper way
		/*if (rinfo.address !== remoteHost || rinfo.port !== remotePort) { 
		/	console.log("Msg received rinfo.address")
		/	return;
		}*/

		// Parse the message, split it to cookie and payload by space
		message = message.toString();

		let spaceIdx = message.indexOf(' ');
		let cookie = message.substr(0, spaceIdx);
		let payload = message.substr(spaceIdx + 1);

		// If well formed then continue processing.5
		if (cookie && payload) {
			let wait = waits[cookie];
			// If we aren't waiting on requests for this cookie then drop this message.
			if (!wait) {
				return;
			}

			try {
				// Attempt to decode the payload.
				payload = Bencode.decode(payload, "utf8");
				wait.resolve(payload);
			}
			catch (error) {
				console.log(error);
				// This shouldn't happen, but could if API changes on rtpengine end.
				wait.reject(new InvalidReplyError (cookie, rinfo.host, rinfo.port));
			}
		}
	}

	socket.on("message", checkWaits);

	this.wait = function (cookie) {
		let resolve;
		let reject;
		let promise = new Bluebird(function () {
			resolve = arguments[0];
			reject = arguments[1];
		});

		let wait = {
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
