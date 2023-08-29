const express = require("express");
const app = express();
const port = 80;
const redis = require("../redis/redis.js");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/api/me/session", async (req, res) => {
	console.log("connec");
	const connection = await redis.setup();
	console.log(await connection.client.get("server_startup"));
	await connection.client.set("clients", 0);
	res.send("{name: 'hi'}");
});

app.listen(port, () => console.log("server listening in port " + port));
