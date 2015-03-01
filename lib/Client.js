"use strict";

var Bluebird  = require("bluebird");
var dgram     = require("dgram");
var paramCase = require("param-case");
var uuid      = require("node-uuid");
var _         = require("lodash");

var Command             = require("./Command");
var WaitManager         = require("./WaitManager");
var RequestTimeoutError = require("./errors/RequestTimeoutError");
var schemas             = require("./schemas");

var DEFAULT_HOST            = "127.0.0.1";
var DEFAULT_MAX_RETRIES     = 3;
var DEFAULT_PORT            = 22222;
var DEFAULT_REQUEST_TIMEOUT = 500;

function Client (options) {
	options = _.defaults(options || {}, {
		host    : DEFAULT_HOST,
		port    : DEFAULT_PORT,
		retries : DEFAULT_MAX_RETRIES,
		timeout : DEFAULT_REQUEST_TIMEOUT
	});

	var socket = Bluebird.promisifyAll(dgram.createSocket("udp4"));
	var manager = new WaitManager(socket, options.port, options.host);

	function sendMessage (cookie, wait, message, retries) {
		retries = retries || 0;

		return socket.sendAsync(message, 0, message.length, options.port, options.host)
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
		var cookie = uuid.v4();

		var message = new Buffer(
			[ cookie, command.bencode() ].join(" ")
		);

		return Bluebird.using(manager.wait(cookie), function (wait) {
			return sendMessage(cookie, wait, message);
		});
	};

	this.destroy = function () {
		socket.close();
	};

	_.forEach([ "ping", "offer", "answer", "delete", "list", "query", "startRecording" ], function (command) {
		this[command] = Bluebird.method(function (options) {
			options = options || {};
			options.command = command;
			options = _.transform(options, function (result, value, key) {
				result[paramCase(key)] = value;
			});

			var schema = schemas[command];
			return this.sendCommand(new Command(schema, options));
		});
	}, this);
}

Client.create = Bluebird.method(function (options) {
	return Bluebird.resolve(new Client(options))
	.disposer(function (client) {
		client.destroy();
	});
});

module.exports = Client;
