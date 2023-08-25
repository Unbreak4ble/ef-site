const express = require("express");
const handleRouting = require("./routing.js");
const app = express();
const port = 80;

handleRouting(app);

app.listen(port, () => console.log("server listening in port " + port));