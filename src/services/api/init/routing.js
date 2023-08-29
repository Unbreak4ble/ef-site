const axios = require("axios");
const express = require("express");
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require("fs");

function handle(app) {
	app.use(function(req, res, next) {
  	res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	next();
	});
	
	let router = express.Router({ mergeParams: true });
	app.get("/", function(req, res) {
			res.send("{name:'hi'}");
	}); 
	router.all("*", (req, res) => {
			res.status(404).send(`${req.url} not found`);
	});
	app.use("/", router);
}

module.exports = handle;
