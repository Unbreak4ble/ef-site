const axios = require("axios");
const express = require("express");
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require("fs");
const { jsonError } = require("../static/errors/response");
const yaml = require("yaml");
const services = yaml.parse(fs.readFileSync("services.yml", "utf8")).services;

function handle(app) {
	let router = express.Router({ mergeParams: true });
	for(let key in services){
		const hostname = services[key].hostname;
		const path = services[key].build.replace(/^\./g, "").replace(/\/$/g, "");
		const port = 80;
		
		router.use(createProxyMiddleware(path, {target: "http://" + hostname + ":" + port + "/", onError: (err, req, res) => {
			//res.status(500).send("service is offline");
			jsonError(res, 503, "service is offline", err);
		}}));
	}
	router.all("*", (req, res) => {
			res.status(404).send(`${req.url} not found`);
	});
	app.use("/", router);
}

module.exports = handle;
