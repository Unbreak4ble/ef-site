const axios = require("axios");
const express = require("express");
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("./static/redis/users.js");
const lib_sessions = require("./static/redis/sessions.js");
const { Crud } = require("./static/redis/crud.js");
const token = require("./static/utils/token.js");
const fs = require("fs");
const ef = require("./static/utils/ef-utils.js")

async function handle(app) {
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use(cors({origin: true, credentials: true}));
	const client = new session.Client();
	await client.connect();

	app.get("/api/sessions", async function(req, res){
		console.log("conencted");
		const body = req.body;
		const auth = req.headers.authorization;
		if(!(body && auth)){
			return res.status(400).send("check headers and payload");
		}
		if(!token.is_all_ok(auth))
			return res.status(401).send();
		const id = token.decode_jwt(auth).userId;
		const client = new session.Client();
		await client.connect();
		let user = (await client.session_get(id));
		if(user == void 0){
			return res.status(401).send("user non-registered");
		}
		user = (await Promise.all(user.sessions.map(async session_id => {
			const client_sessions = new lib_sessions.Sessions();
			await client_sessions.connect();
			const ss = await client_sessions.get(session_id);
			return ss;
		}))).map(x => x[0]);
		let payload = [];
		for(let i=0; i<user.length; i++){
			const ss_token = user[i].token;
			if(!ss_token) continue;
			delete user[i].token;
			const ss = ef.generate_payload(ss_token);
			payload.push({...user[i], ...ss});
		}
		res.send(JSON.stringify(payload));
	});

	app.post("/api/sessions", async function(req, res){
		const body = req.body;
		const auth = req.headers.authorization;
		const id = token.decode_jwt(auth).userId;
		const tokens = body.token;
		if(!token.is_all_ok(auth))
			return res.status(401).send();
		const ss_client = new lib_sessions.Sessions();
		await ss_client.connect();
		const ss_id = await ss_client.add(tokens);
	
		const user_client = new session.Client();
		await user_client.connect();
		const user = await user_client.session_get(id);
		if(user == void 0){
			return res.status(401).send("invalid token");
		}
		user.sessions = (user.sessions || []);
		user.sessions.push(ss_id);
		await user_client.session_update(id, user);
		res.send();
	});
	
	app.all("*", (req, res) => {
			res.status(404).send(`${req.url} not found`);
	});
}

module.exports = handle;
