"use strict";

var Joi = require("joi");

module.exports = Joi.object().keys({
	command      : Joi.string().required().valid("start recording"),
	"call-id"    : Joi.string().required(),
	"from-tag"   : Joi.string().optional(),
	"to-tag"     : Joi.string().optional(),
	"via-branch" : Joi.string().optional()
});
