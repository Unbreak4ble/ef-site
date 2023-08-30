const axios = require("axios");
const express = require("express");
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("./session.js");
const { Crud } = require("./redis.js");
const token = require("./token.js");
const fs = require("fs");

async function handle(app) {
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use(cors({origin: true, credentials: true}));
	const client = new session.Client();
	await client.connect();

	app.post("/api/login", async function(req, res) {
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

	app.post("/api/register", async function(req, res) {
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

	app.get("/api/sessions", async function(req, res){
		const body = req.body;
		const auth = req.headers.authorization;
		if(!token.is_all_ok(auth))
			return res.status(401).send();
		const id = token.decode_jwt(auth).userId;
		const crud = new Crud();
		await crud.connect();
		crud.handleKey("sessions");
		const sessions = await crud.get(id+"");
		res.send(sessions);
	});

	app.post("/api/sessions", async function(req, res){
		
	});
	
	app.all("*", (req, res) => {
			res.status(404).send(`${req.url} not found`);
	});
}

module.exports = handle;
