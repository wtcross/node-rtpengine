"use strict";

var Joi = require("joi");

module.exports = Joi.object().keys({
	command : Joi.string().required().valid("list"),
	limit   : Joi.number().optional().integer().min(0)
});
