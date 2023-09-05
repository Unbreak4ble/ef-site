const lib_sessions = require("../static/redis/sessions.js");
const lib_ws = require("ws");

const main_ip = "172.25.0.100";

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
		this.websocket = new lib_ws.WebSocket("ws://"+main_ip+"/api/events");
		await (new Promise(res => this.websocket.on("open", () => {
			const data = {broadcast: true};
			this.websocket_send(JSON.stringify(data));
			res();
		})));
		await this.sessions.connect();
	}

	websocket_send(msg){
		try{
			this.websocket.send(msg, { binary: false });
		}catch{}
	}

	async run(){
		let count = 0;
		this.websocket_send(JSON.stringify({id: this.id, job_status: 1}));
		this.sessions.update(this.id, {begin_time: get_time()});
		setInterval(() => {
			if(this.stop_job) return;

			this.sessions.update(this.id, {activities_done: ++count, job_status: 1});
		}, 1000);
	}

	async stop(){
		this.stop_job = true;
		this.sessions.update(this.id, {job_status: 0});
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
