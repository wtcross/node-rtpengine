"use strict";

var Joi = require("joi");

module.exports = Joi.object().keys({
	command      : Joi.string().required().valid("delete"),
	"call-id"    : Joi.string().required(),
	"from-tag"   : Joi.string().required(),
	"to-tag"     : Joi.string().optional(),
	"via-branch" : Joi.string().optional(),
	flags        : Joi.array().optional().unique().includes(
		Joi.string().valid("fatal")
	)
});
