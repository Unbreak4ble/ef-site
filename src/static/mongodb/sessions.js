const {Crud} = require("./crud.js");
const lib_token = require("../utils/token.js");

class Sessions {
	constructor() {
		this.client = new Crud();
	}

	connect = async () => {
		await this.client.connect();
		this.client.handledb("sessions");
		this.client.handleCollection("sessions");
	}

	close = () => {
		this.client.close();
	}

	get = async(id) => {
		const session = await this.client.get({id: id});
		return session;
	}
	
	add = async(token, xaccess, username="") => {
		const id = lib_token.rand_id();
		await this.client.add({id: id, token: token, xaccess: xaccess, username: username, begin_time: 0, activities_done: 0, current_activity: ""});
		return id;
	}

	update = async(id, opts) => {
		await this.client.update({id: id}, {$set: opts});
	}

	remove = async(id) => {
		await this.client.remove({id: id});
		return true;
	}
}

module.exports = { Sessions };
