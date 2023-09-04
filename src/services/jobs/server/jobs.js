const lib_sessions = require("../static/redis/sessions.js");

function get_time(){
	return Math.floor(new Date().getTime()/1000);
}

class Job {
	constructor(id){
		this.id = id;
		this.mode = 0;
		this.sessions = new lib_sessions.Sessions();
		this.stop_job = false;
	}

	async connect(){
		await this.sessions.connect();
	}

	async run(){
		let count = 0;
		console.log("running for user ", this.id);
		this.sessions.update(this.id, {begin_time: get_time()});
		setInterval(() => {
			if(this.stop_job) return;

			this.sessions.update(this.id, {activities_done: ++count});
		}, 1000);
	}

	async stop(){
		this.stop_job = true;
		console.log("stopping for user ", this.id);	
	}

	/*
	 * 0 = normal
	 * 1 = boost
	 */
	setMode(mode){
		if(!(mode instanceof Number)){
			return;
		}
		this.mode = mode;
	}
}

module.exports = {Job};
