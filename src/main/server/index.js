const express = require("express");
const handleRouting = require("./routing.js");
const app = express();
const port = 80;
const redis = require("../static/redis/redis.js");

handleRouting(app);

app.listen(port, async () => {
	const conn = await redis.setup();
	conn.client.set("server_startup", (new Date()).getTime());
	console.log("server listening in port " + port);
});
