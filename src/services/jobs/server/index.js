const express = require("express");
const routing = require("./routing.js");
const port = 80;

const app = express();
app.use(express.json());

routing(app);

app.listen(port, () => console.log("job service running in port "+port));
