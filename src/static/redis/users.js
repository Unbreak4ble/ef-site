const { createClient } = require("redis");
const token = require("../utils/token.js"); 

class Client {
	constructor() {
		this.client = {};
	}
	
	connect = async() => new Promise(async resolve => {
        const client = createClient({
                url: "redis://redis_server"
        });
        let connected = false;
        client.on("ready", () => connected = true);

        await client.connect();
				this.client = client;
        resolve(connected);
	});

	close = () => {
		this.client.quit();
	}

	session_append = async (name, value) => {
		const client = this.client;
		const sessions = await client.get("session");
		let session_json = JSON.parse(sessions);
		let id = token.rand_id();
		let userToken = token.encode_jwt({userId: id, name: name});
		session_json.sessions.push({id: id, name: name, password: value, token: userToken, sessions: []});
		let sessions_back = JSON.stringify(session_json);
		await client.set("session", sessions_back);
		return userToken;
	};

	new_session = async(opts) => {
		const user = await this.session_filter(opts);
		if(!user) 
			return null;
		const userId = user.id;
		const userName = user.name;
		let userToken = user.token;
		if(!token.is_expired(userToken))
			return userToken;
		else{
			userToken = token.encode_jwt({userId: userId, name: userName});
			await this.session_update(userId, {token: userToken});
			return userToken;
		}
	}

	session_update = async(id, value) => {
		const client = this.client;
		const sessions = await client.get("session");
		let session_json = JSON.parse(sessions);
		
		for(let i=0; i<session_json.sessions.length; i++){
			if(session_json.sessions[i].id == id) {
				for(let key in value){
					session_json.sessions[i][key] = value[key];
				}
			}
		}

		let sessions_back = JSON.stringify(session_json);
		await client.set("session", sessions_back);
		return id;

	}

	session_delete = async (id) => {
		const client = this.client;
		const sessions = await client.get("session");
		let session_json = JSON.parse(sessions);
	
		for(let ss in session_json){
			let session = session_json.sessions[ss];
			if(session.id == id)
				delete session_json.sessions[ss];
		}

		let sessions_back = JSON.stringify(session_json);
		await client.set("session", sessions_back);
	};

	session_get = async (id) => {
		const client = this.client;
		const sessions = await client.get("session");
		let session_json = JSON.parse(sessions).sessions;
		
		for(let ss in session_json){
			let session = session_json[ss];
			if(session.id == id)
				return session;
		}
		return null;
	};

	session_filter = async(opts) => {
		const client = this.client;
		const sessions = await client.get("session");
		let session_json = JSON.parse(sessions).sessions;
		for(let ss in session_json){
			let session = session_json[ss];
			let eqs=0;
			for(let key in opts){
				if(session[key] == opts[key])
					++eqs;
			}
			if(eqs == Object.keys(opts).length){
				return session;
			}
		}
		return null;

	}

	session_exists = async(name) => {
		const client = this.client;
		const sessions = await client.get("session");
		let session_json = JSON.parse(sessions).sessions;
		
		for(let ss in session_json){
			let session = session_json[ss];
			if(session.name == name)
				return true;
		}
		return false;
	}
};

module.exports = {Client}
