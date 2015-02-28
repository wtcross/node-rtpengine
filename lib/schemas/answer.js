"use strict";

var Joi = require("joi");

var OFFER_SCHEMA = require("./offer");

module.exports = Joi.object().keys({
	command  : Joi.string().required().valid("offer"),
	"to-tag" : Joi.string().required()
}).concat(OFFER_SCHEMA);
