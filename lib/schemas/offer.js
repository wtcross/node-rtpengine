"use strict";

var Joi = require("joi");

module.exports = Joi.object().keys({
	command      : Joi.string().required().valid("offer"),
	sdp          : Joi.string().required(),
	"call-id"    : Joi.string().required(),
	"from-tag"   : Joi.string().required(),
	"via-branch" : Joi.string().optional(),

	flags : Joi.array().optional().unique().includes(
		Joi.string().valid([
			"SIP source address",
			"SIP-source-address",
			"trust address",
			"trust-address",
			"symmetric",
			"asymmetric",
			"strict source",
			"strict-source",
			"media handover",
			"media-handover"
		])
	),

	replace : Joi.array().optional().unique().includes(
		Joi.string().valid([
			"origin",
			"session connection",
			"session-connection"
		])
	),

	direction : Joi.array().optional().unique().includes(
		Joi.string().valid("pub", "priv")
	),

	"received from" : Joi.array().optional().length(2),

	ICE : Joi.string().optional().valid("remove", "force", "force-relay"),

	"transport protocol" : Joi.string().optional().valid([
		"RTP/AVP", "RTP/AVPF", "RTP/SAVP", "RTP/SAVPF"
	]),

	"media address" : Joi.string().optional().hostname(),

	"address family" : Joi.string().optional().valid("IP4", "IP6"),

	"rtcp-mux" : Joi.array().optional().unique().includes(
		Joi.string().valid("offer", "demux", "accept", "reject")
	),

	TOS : Joi.number().optional().integer(),

	DTLS : Joi.string().valid("passive")
});
