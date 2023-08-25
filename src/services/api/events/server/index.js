const express = require("express");
const app = express();
const port = 80;

app.get("/api/events", (req, res) => {
	res.send("events me");
});

app.listen(port, () => console.log("server listening in port " + port));
