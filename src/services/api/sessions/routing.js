const axios = require("axios");
const express = require("express");
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const lib_users = require("./static/mongodb/users.js");
const lib_sessions = require("./static/mongodb/sessions.js");
const { Crud } = require("./static/mongodb/crud.js");
const lib_token = require("./static/utils/token.js");
const fs = require("fs");
const ef = require("./static/utils/ef-utils.js");

function filterObject(obj, ...properties){
	for(const key in obj){
		if(!properties.includes(key)){
			delete obj[key];
		}
	}
	return obj;
}

async function handleAuthorization(req, res, next){
	const client_users = new lib_users.Client();
	await client_users.connect();
	
	const auth = req.headers.authorization;
	if(!auth){
		return res.status(401).send("missing authorization header");
	}

	if(!lib_token.is_all_ok(auth))
		return res.status(401).send();

	await client_users.close();
	next();
}

async function handle(app) {
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use(cors({origin: true, credentials: true}));
	app.use(handleAuthorization);
	const client_users = new lib_users.Client();
	await client_users.connect();
	
	const client_sessions = new lib_sessions.Sessions();
	await client_sessions.connect();

	app.get("/api/sessions", async function(req, res){
		const body = req.body;
		const auth = req.headers.authorization;

		const id = lib_token.decode_jwt(auth).userId;

		let user = await client_users.session_get(id);

		if(user == void 0){
			return res.status(401).send("user non-registered");
		}

		let user_sessions = (await Promise.all(user.sessions.map(async session_id => {
			const ss = await client_sessions.get(session_id);
			return ss;
		})));

		let payload = [];
		
		for(let i=0; i<user_sessions.length; i++){
			if(user_sessions[i] == void 0) continue;
			const ss_token = user_sessions[i].token;
			if(ss_token == void 0) continue;
			const ss = ef.generate_payload(ss_token);
			payload.push({...user_sessions[i], ...ss});
		}

		res.send(JSON.stringify(payload));
	});

	app.post("/api/sessions", async function(req, res){
		const body = req.body;
		const auth = req.headers.authorization;
		const id = lib_token.decode_jwt(auth).userId;
		const token = body.token;
		const xaccess = body.xaccess;
		const username = body.username ?? "";

		if((token == void 0 || !token.length) || (xaccess == void 0 || !xaccess.length)){
			return res.status(400).send("token or xaccess not found");
		}

		const ss_id = await client_sessions.add(token, xaccess, username);
		const user = await client_users.session_get(id);
		
		if(user == void 0){
			return res.status(401).send("invalid token");
		}

		user.sessions = (user.sessions || []);
		user.sessions.push(ss_id);
		await client_users.session_update(id, user);

		res.send();
	});

	app.delete("/api/sessions", async function(req, res){
		const body = req.body;
		const auth = req.headers.authorization;
		const userId = lib_token.decode_jwt(auth).userId;
		const id = body.id;
		
		if(id == void 0 || !id.length){
			return res.status(400).send("check id");
		}
		
		const user = await client_users.session_get(userId);
		
		if(user == void 0){
			return res.status(401).send("invalid token");
		}

		const sess = user.sessions.filter(x => x == id);
		
		if(!sess.length){
			return res.status(406).send("not found");
		}
		const idx = user.sessions.indexOf(sess[0]);
		const remove_status = await client_sessions.remove(id);
		if(!remove_status){
			return res.status(500).send("failed to remove");
		}
		user.sessions.splice(idx, 1);
		await client_users.session_update(userId, user);
		
		res.send();
	});

	app.put("/api/sessions", async (req, res) => {
		const body = req.body;
		const auth = req.headers.authorization;
		const id = body.id;
		
		if(!body.id){
			return res.status(400).send("missing id");
		}

		if(!body.update){
			return res.status(400).send("nothing to update? Missing update header");
		}
		const filteredUpdate = filterObject(body.update, "username", "token", "xaccess");

		if(Object.keys(filteredUpdate).length == 0){
			return res.status(400).send("nothing to update? Chose between token, xaccess or username to update");
		}

		await client_sessions.update(id, filteredUpdate);
		
		res.send();

	});
	
	app.all("*", (req, res) => {
			res.status(404).send(`${req.url} not found`);
	});
}

module.exports = handle;
