const api_utils = require("./api.js");

class Automation {
	constructor(token, xaccess) {
		this.token = token;
		this.xaccess = xaccess;
		this.stopped = false;
	}

	start() {

	}

	stop() {
		this.stopped = true;
	}
}

module.exports = {Automation};
