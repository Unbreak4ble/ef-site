const api = require("./routing/api.js");
const page = require("./routing/page.js");

function handle(app) {
	app.use("/api", api);
	app.use("/page", page);
}

module.exports = handle;
