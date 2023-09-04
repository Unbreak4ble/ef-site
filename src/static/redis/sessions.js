const redis = require("./crud.js");
const token = require("../utils/token.js");

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

	get = async(id) => {
		let sessions = await this.client.get();
		let session = sessions.filter(x => x.id == id);
		session ??= session[0];
		return session;
	}
	
	add = async(ss_token) => {
		let sessions = await this.client.get();
		const id = token.rand_id();
		sessions.push({id: id, token: ss_token, begin_time: 0, activities_done: 0, current_activity: ""});
		await this.client.set(JSON.stringify(sessions));
		return id;
	}

	update = async(id, opts) => {
		let sessions = await this.client.get();
		let session = sessions.filter(x => x.id == id);
		if(session.length == 0){
			return;
		}
		let index = sessions.indexOf(session[0]);
		Object.assign(sessions[index], opts);
		
		await this.client.set(JSON.stringify(sessions));
	}

	remove = async(id) => {
		let sessions = await this.client.get();
		for(let i=0; i<sessions.length; i++){
			if(sessions[i].id == id){
				sessions.splice(i, 1);
				return true;
			}
		}
		await this.client.set(JSON.stringify(sessions));
		return false;
	}
}

module.exports = { Sessions };
