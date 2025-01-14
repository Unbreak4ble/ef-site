const express = require("express");
const cors = require("cors");
const routing = require("./routing.js");
const port = 80;

const app = express();
app.use(express.json());
app.use(cors({origin: true, credentials: true}));
app.use(express.urlencoded({ extended: true }));

routing(app);

app.listen(port, () => console.log("job service running in port "+port));
