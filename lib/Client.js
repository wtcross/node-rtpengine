"use strict";

var Bluebird = require("bluebird");
var dgram    = require("dgram");
var uuid     = require("node-uuid");
var _        = require("lodash");

var RequestManager      = require("./RequestManager");
var RequestTimeoutError = require("./errors/RequestTimeoutError");
var commands            = require("./commands");

var TIMEOUT      = 500;
var MAX_RETRIES  = 3;
var DEFAULT_PORT = 22222;
var DEFAULT_HOST = "127.0.0.1";

function Client (remotePort, remoteHost) {
	remotePort = remotePort || DEFAULT_PORT;
	remoteHost = remoteHost || DEFAULT_HOST;

	var socket = Bluebird.promisifyAll(dgram.createSocket("udp4"));
	var manager = new RequestManager(socket, remotePort, remoteHost);

	function sendMessage (cookie, wait, message, retries) {
		retries = retries || 0;

		return socket.sendAsync(message, 0, message.length, remotePort, remoteHost)
		.catch(function (error) {
			console.log(error);
		})
		.error(function (error) {
			console.error("error: " + error);
		})
		.then(function () {
			return wait.promise
			.timeout(TIMEOUT)
			.catch(Bluebird.TimeoutError, function () {
				if (retries < MAX_RETRIES) {
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

		return Bluebird.using(manager.createWait(cookie), function (wait) {
			return sendMessage(cookie, wait, message);
		});
	};

	this.ping = function (options) {
		options = options || {};
		_.merge(options, { command : "ping" });
		return this.sendCommand(new commands.Ping(options));
	};

	this.offer = function (options) {
		options = options || {};
		_.merge(options, { command : "offer" });
		return this.sendCommand(new commands.Offer(options));
	};

	this.answer = function (options) {
		options = options || {};
		_.merge(options, { command : "answer" });
		return this.sendCommand(new commands.Answer(options));
	};

	this.delete = function (options) {
		options = options || {};
		_.merge(options, { command : "delete" });
		return this.sendCommand(new commands.Delete(options));
	};

	this.list = function (options) {
		options = options || {};
		_.merge(options, { command : "list" });
		return this.sendCommand(new commands.List(options));
	};

	this.query = function (options) {
		options = options || {};
		_.merge(options, { command : "query" });
		return this.sendCommand(new commands.Query(options));
	};

	this.startRecording = function (options) {
		options = options || {};
		_.merge(options, { command : "start recording" });
		return this.sendCommand(new commands.StartRecording(options));
	};

	this.destroy = function () {
		socket.close();
	};
}

module.exports = Client;
