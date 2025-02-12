const lib_sessions = require("../static/mongodb/sessions.js");
const lib_ef_auto = require("../static/utils/ef-api");
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
		this.stopped = false;
		this.allow_interval = true;
	}

	async connect(){
		this.websocket = new lib_ws.WebSocket("ws://"+main_ip+"/api/events");
		await (new Promise(res => this.websocket.on("open", () => {
			const data = {broadcast: true};
			this.websocket_send(JSON.stringify(data));
			res();
		})));
		await this.sessions.connect();

		const session_info = await this.sessions.get(this.id);
		const token = session_info.token;
		const xaccess = session_info.xaccess;
		this.automation = new lib_ef_auto.Automation(token, xaccess);
	}

	websocket_send(msg){
		try{
			this.websocket.send(msg, { binary: false });
		}catch{}
	}

	async pushLog (msg) {
		await this.sessions.pushLog(this.id, msg);
	}

	async run(){
		let count = 0;
		await this.sessions.update(this.id, {begin_time: get_time(), job_status: 1, activities_done: 0, logs: [], current: {lesson_name: "", step_name: "", unit_name: "", level_name: ""}});
		await this.pushLog("starting job...");
		while(!this.stopped){
			try{
				const current = await this.automation.next(this.allow_interval, [this.id, this.sessions]);
				if(this.stopped) return;
				const updated_result = await this.sessions.update(this.id, {current: current.current});
				if(!updated_result){
					await this.stop();
					break;
				}
				await current.do();
				await this.sessions.update(this.id, {activities_done: ++count});
			}catch(err){
				console.log(err);
				await this.pushLog("job crashed.");
				await this.stop(true);
			}
		}
	}

	async stop(crash=false){
		if(this.stopped) return;
		try{
			this.stopped = true;
			await this.pushLog("job stopped.");
			await this.sessions.update(this.id, {job_status: crash ? 2 : 0});
			this.sessions.close();
		}catch{}
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
