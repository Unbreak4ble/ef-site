const express = require("express");
const handleRouting = require("./routing.js");
const app = express();
const port = 80;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

handleRouting(app);

app.listen(port, async () => {
	console.log("server listening in port " + port);
});
