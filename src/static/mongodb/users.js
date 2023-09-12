const token = require("../utils/token.js"); 
const {Crud} = require("./crud.js");

class Client {
	constructor() {
		this.client = new Crud();
		this.projection_payload = {
			id: true,
			name: true,
			password: true,
			token: true,
			sessions: true
		};
	}
	
	connect = async() => {
		await this.client.connect();

		this.client.handledb("users");

		this.client.handleCollection("users");
	};

	close = () => {
		this.client.close();
	}

	session_append = async (name, value) => {
		let id = token.rand_id();
		let userToken = token.encode_jwt({userId: id, name: name});
		this.client.add({id: id, name: name, password: value, token: userToken, sessions: []});
		return userToken;
	};

	new_session = async(email, password) => {
		const payload = {
			name: email,
			password: password
		};
		const user = (await this.client.filter(payload, this.projection_payload))[0];
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

	session_update = async(id, obj) => {
		const client = this.client;
		await client.set({id: id}, obj);
	}

	session_delete = async (id) => {
		const client = this.client;
		await client.remove({id: id});
	};

	session_get = async (id) => {
		const client = this.client;
		const result = await client.get({id: id});
		return result;
	};

	session_filter = async(opts) => {
		const client = this.client;
		const result = await client.filter(opts);
		return result;
	}

	session_exists = async(name) => {
		const client = this.client;
		const sessions = await client.get({name: name});
		return sessions != void 0;
	}
};

module.exports = {Client}
