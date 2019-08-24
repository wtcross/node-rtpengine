"use strict";

const Bluebird  = require("bluebird");
const Bencode = require("bencode");
const dgram     = require("dgram");
const paramCase = require("param-case");
const uuid      = require("node-uuid");
const _         = require("lodash");

const Command             = require("./Command");
const WaitManager         = require("./WaitManager");
const RequestTimeoutError = require("./errors/RequestTimeoutError");
const schemas             = require("./schemas");

const DEFAULT_HOST            = "127.0.0.1";
const DEFAULT_MAX_RETRIES     = 3;
const DEFAULT_PORT            = 22222;
const DEFAULT_REQUEST_TIMEOUT = 500;

function Client (options) {
	const self = this;
	options = _.defaults(options || {}, {
		host    : DEFAULT_HOST,
		port    : DEFAULT_PORT,
		retries : DEFAULT_MAX_RETRIES,
		timeout : DEFAULT_REQUEST_TIMEOUT
	});

	const socket = Bluebird.promisifyAll(dgram.createSocket("udp4"));
	const manager = new WaitManager(socket, options.port, options.host);

	function sendMessage (cookie, wait, message, retries) {
		retries = retries || 0;
		return socket.sendAsync(message, options.port, options.host)
		.catch(function (error) {
			console.log(error);
		})
		.error(function (error) {
			console.error("error: " + error);
		})
		.then(function () {
			return wait.promise
			.timeout(options.timeout)
			.catch(Bluebird.TimeoutError, function () {
				if (retries < options.retries) {
					return sendMessage(cookie, wait, message, retries + 1);
				}
				else {
					throw new RequestTimeoutError(cookie, retries);
				}
			});
		});
	}

	this.sendCommand = function (command) {
		let cookie = uuid.v4();

		let message = new Buffer(
			[ cookie, command.bencode() ].join(" ")
		);

		return Bluebird.using(manager.wait(cookie), function (wait) {
			return sendMessage(cookie, wait, message);
		});
	};

	this.destroy = function () {
		socket.close();
	};

	for (let command of [ "ping", "offer", "answer", "delete", "list", "query", "startRecording" ]) {
		this[command] = Bluebird.method(function (options) {
			options = options || {};
			options.command = command;
			/*options = _.transform(options, function (result, value, key) {
				result[paramCase(key)] = value;
			});*/

			let schema = schemas[command];
			return self.sendCommand(new Command(schema, options));
		});
	}
}

Client.create = Bluebird.method(function (options) {
	return Bluebird.resolve(new Client(options))
	.disposer(function (client) {
		client.destroy();
	});
});

module.exports = Client;
