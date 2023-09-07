const axios = require("axios");
const express = require("express");
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require("fs");
const { jsonError } = require("../static/errors/response");
const yaml = require("yaml");
const services = yaml.parse(fs.readFileSync("services.yml", "utf8")).services;

function handle(app) {
	for(let key in services){
		const hostname = services[key].hostname;
		const path = services[key].build.replace(/^\./g, "").replace(/\/$/g, "");
		const port = 80;
		
		app.use(createProxyMiddleware(path, {target: "http://" + hostname + ":" + port, ws: true, onError: (err, req, res) => {
			jsonError(res, 503, "service is offline", err);
		}}));
	}
	app.all("*", (req, res) => {
			res.status(404).send(`${req.url} not found`);
	});
}

module.exports = handle;
