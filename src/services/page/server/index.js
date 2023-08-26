const express = require("express");
const app = express();
const port = 80;

app.get("/page", (req, res) => {
	res.sendFile(__dirname + "/frontend/index.html");
});

app.listen(port, () => console.log("server listening in port " + port));
