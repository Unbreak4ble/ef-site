const lib_job = require("./jobs");

let workingJobs = [];

async function startJob(req, res) {
	const body = req.body;
	const id = body.id;
	
	if(id == void 0){
		res.status(400).send('{"message": "specify id"}');
		return 0;
	}

	if(workingJobs.filter(x => x.id == id).length > 0){
		res.status(409).send('{"message": "already started"}');
		return;
	}
	
	const job = new lib_job.Job(id);
	await job.connect();

	workingJobs.push({
		id: id,
		job: job
	});
	
	job.run();
	res.send();
}

async function stopJob(req, res) {
	const body = req.body;
	const id = body.id;
	if(id == void 0){
		res.status(400).send('{"message": "specify id"}');
		return;
	}
	
	const _job = new lib_job.Job(id);
	await _job.connect();
	_job.stop();

	let job = workingJobs.filter(x => x.id == id);
	if(job.length == 0){
		res.status(404).send('{"message": "not running"}');
		return;
	}else{
		job = job[0];
	}
	
	const index = workingJobs.indexOf(job);
	job.job.stop();
	workingJobs.splice(index, 1);
	res.send();
}

async function infoJob(req, res) {
	const body = req.query;
	const id = body.id;
	
	if(id == void 0){
		res.status(400).send('{"message": "specify id"}');
		return;
	}
	
	let job = workingJobs.filter(x => x.id == id);
	if(job.length == 0){
		res.send('{"running": false}');
		return;
	}else{
		job = job[0];
	}

	res.send('{"running": true}');
}

function routing(app){
	app.get("/jobs/", (req, res) => res.send("OK"));
	app.post("/jobs/start", startJob);
	app.post("/jobs/stop", stopJob);
	app.get("/jobs/info", infoJob);
}

module.exports = routing;
