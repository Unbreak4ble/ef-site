const axios = require("axios");
const express = require("express");
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const lib_users = require("./static/mongodb/users.js");
//const lib_sessions = require("./static/mongodb/sessions.js");
const { Crud } = require("./static/mongodb/crud.js");
const lib_token = require("./static/utils/token.js");
const fs = require("fs");
const ef = require("./static/utils/ef-utils.js")

function generateError(content){
	return {status: "error", content: content};
}

function generateOk(content){
	return {status: "OK", content: content};
}

async function handle(app) {
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use(cors({origin: true, credentials: true}));
	const client = new lib_users.Client();
	await client.connect();

	app.post("/api/users/login", async function(req, res) {
		const body = req.body;
		if(!(body.email && body.password)){
			res.status(400).send(generateError("email or password not found"));
			return;
		}
		const token = await client.new_session(body.email, body.password);
		if(!token)
			res.send(generateError("invalid email or password"));
		else{
			res.send(generateOk(token));
		}
	});

	app.post("/api/users/register", async function(req, res) {
		const body = req.body;
		if(!(body.email && body.password)){
			res.status(400).send(generateError("email or password not found"));
			return;
		}
		if(await client.session_exists(body.email)){
			res.send(generateError("user already registered"));
		}else{
			const token = await client.session_append(body.email, body.password);
			res.send(generateOk(token));
		}
	});

	app.post("/api/users/validate", async(req, res) => {
		const body = req.body;
		if(!(body && body.token)){
			return res.status(400).send("missing token parameter");
		}
		const token = body.token;

		let isValid = lib_token.is_all_ok(token);
		const token_payload = lib_token.decode_jwt(token);
		const token_id = token_payload.userId;
		if(isValid){
			const user = await client.session_get(token_id);
			isValid = user != void 0;
		}
		res.send(isValid);
	});
	
	app.all("*", (req, res) => {
			res.status(404).send(`${req.url} not found`);
	});
}

module.exports = handle;
