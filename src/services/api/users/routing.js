const axios = require("axios");
const express = require("express");
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("./static/redis/users.js");
const lib_sessions = require("./static/redis/sessions.js");
const { Crud } = require("./static/redis/crud.js");
const lib_token = require("./static/utils/token.js");
const fs = require("fs");
const ef = require("./static/utils/ef-utils.js")

async function handle(app) {
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use(cors({origin: true, credentials: true}));
	const client = new session.Client();
	await client.connect();

	app.post("/api/users/login", async function(req, res) {
		const body = req.body;
		if(!(body.email && body.password)){
			res.status(400).send("email or password not found");
			return;
		}
		const token = await client.new_session({name: body.email, password: body.password});
		if(!token)
			res.send({status: "error", content: "invalid email or password"});
		else{
			res.send({status: "OK", content: token});
		}
	});

	app.post("/api/users/register", async function(req, res) {
		const body = req.body;
		if(!(body.email && body.password)){
			res.status(400).send("email or password not found");
			return;
		}
		if(await client.session_exists(body.email)){
			res.send("user already registered");
		}else{
			const token = await client.session_append(body.email, body.password);
			res.send(token);
		}
	});

	app.post("/api/users/validate", async(req, res) => {
		const body = req.body;
		if(!(body && body.token)){
			return res.status(400).send("missing token parameter");
		}
		const token = body.token;

		const isValid = lib_token.is_all_ok(token);

		res.send(isValid);
	});
	
	app.all("*", (req, res) => {
			res.status(404).send(`${req.url} not found`);
	});
}

module.exports = handle;
