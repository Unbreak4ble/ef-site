const express = require("express");
const app = express();
const port = 80;

app.get("/", (req, res) => {
	res.send("fine");
});

app.listen(port, () => console.log("server listening in port " + port));
