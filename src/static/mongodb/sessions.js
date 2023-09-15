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
		await this.client.add({id: id, token: token, xaccess: xaccess, username: username, begin_time: 0, activities_done: 0, current: {}, logs: []});
		return id;
	}

	pushLog = async(id, message) => {
		return (await this.client.update({id: id}, {$push: {logs: {message: message, time: (new Date()).getTime()}}}));
	}

	update = async(id, opts) => {
		return (await this.client.update({id: id}, {$set: opts}));
	}

	remove = async(id) => {
		await this.client.remove({id: id});
		return true;
	}

	watch = (callback) => {
		console.log("watching changes");
		const onChange = (data) => {
			console.log("changed", data);
		};
		this.client.track({}, {id: true}, onChange);
	}
}

module.exports = { Sessions };
