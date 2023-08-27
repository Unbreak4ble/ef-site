const express = require("express");
const app = express();
const port = 80;
const redis = require("../redis/redis.js");

app.get("/api/events", async (req, res) => {
	const connection = await redis.setup();
	console.log(await connection.client.get("server_startup"));
	await connection.client.set("clients", 0);
	res.send("events me modifield. everything working fine!!!");
});

app.listen(port, () => console.log("server listening in port " + port));
