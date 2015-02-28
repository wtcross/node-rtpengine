"use strict";

var Joi = require("joi");

module.exports = Joi.object().keys({
	command : Joi.string().valid("ping").required(),
});
