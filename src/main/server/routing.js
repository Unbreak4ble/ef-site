const axios = require("axios");
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require("fs");
const yaml = require("yaml");
const services = yaml.parse(fs.readFileSync("compose.yml", "utf8")).services;

function handle(app) {
	for(let key in services){
		const hostname = services[key].hostname;
		const path = services[key].build.replace(/^\./g, "").replace(/\/$/g, "");
		const port = 80;
		
		app.use(createProxyMiddleware(path, {target: "http://" + hostname + ":" + port + "/"}));
	}

	app.all("*", (req, res) => {
			res.status(404).send(`${req.url} not found`);
	});
}

module.exports = handle;
