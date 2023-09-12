const express = require("express");
const websocket = require("./websocket.js");
const http = require("http");

const app = express();
const port = 80;
const server = http.createServer(app);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.json());
websocket(server);

app.post("/api/events/job", async (req, res) => {
	const body = req.body;
	console.log(body);
})

server.listen(port, () => console.log("server listening in port " + port));
