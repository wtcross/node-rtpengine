"use strict";

const Joi = require("joi");

const BASE_SCHEMA = require("./offerAnswerBase");

module.exports = BASE_SCHEMA.keys({
	command  : Joi.string().required().valid("offer"),
	"from-tag" : Joi.string().required()
});

