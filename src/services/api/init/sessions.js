const redis = require("./redis.js");
const token = require("./token.js");

class Sessions {
	constructor() {
		this.client = {};
	}

	connect = async () => {
		const client = new redis.Crud();
		await client.connect();
		client.handleKey("sessions");
		this.client = client;
	}
	
	add = async(id, ss_token) => {
		let sessions = await this.client.get();
		sessions[id] = sessions[id] || [];
		sessions[id].push({id: token.rand_id(), token: ss_token, begin_time: 0, activites_done: 0, current_activity: ""});
		await this.client.set(JSON.stringify(sessions));
	}

	remove = async(userId, id) => {

	}
}

module.exports = { Sessions };
