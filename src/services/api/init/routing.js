const axios = require("axios");
const express = require("express");
const { createProxyMiddleware } = require('http-proxy-middleware');
const redis = require("./redis.js");
const fs = require("fs");

async function handle(app) {
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	const client = await redis.init_client();

	app.use(function(req, res, next) {
  	res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	next();
	});
	
	app.post("/api/login", function(req, res) {
		const body = req.body;
		console.log(body);
	});

	app.post("/api/register", async function(req, res) {
		const body = req.body;
		if(!(body.email || body.password)){
			res.status(400).send("email or password not found");
			return;
		}
		if(redis.session_exists(body.email)){
			res.status(203).send("user already registered");
		}else{
			await session_append(email, password);
			res.send(token);
		}
	});

	app.get("/api/sessions", function(){

	});
	
	app.all("*", (req, res) => {
			res.status(404).send(`${req.url} not found`);
	});
}

module.exports = handle;
