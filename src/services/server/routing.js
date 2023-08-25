const axios = require("axios");
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require("fs");
const services = JSON.parse(fs.readFileSync("server/services.json", "utf8")).services;

function handle(app) {
	for(let service of services){
		const path = service.path;
		const name = service.name;
		const hostname = service.hostname;
		const port = service.port;

		app.use(createProxyMiddleware(path, {target: "http://" + hostname + ":" + port + "/"}));
	}

	app.all("*", (req, res) => {
			res.status(404).send("api found");
	});
}

module.exports = handle;
