const api_utils = require("./api.js");

async function getCurrentLessonId(token, xaccess){
	let course = (await api_utils.getCurrentLesson(api_utils.mountCredentials(token, xaccess))).data;
	if(!(course && course.length)) return;
	course = course[0];
	const lesson_id = course.studentLesson.id;
	return lesson_id;
};

async function loadLessonSteps(token, xaccess, id){
	let lesson = (await api_utils.loadLesson(
		api_utils.mountCredentials(token, xaccess),
		id
	)).data;
	console.log("lesson:", lesson);
	if(!lesson) return;
}

async function loadNextActivity(token, xaccess){
	const lesson_id = await getCurrentLessonId(token, xaccess);
	console.log("course:", lesson_id);
	if(!lesson_id) return;
	const steps = await loadLessonSteps(token, xaccess, lesson_id);
}

class Automation {
	constructor(token, xaccess) {
		this.token = token;
		this.xaccess = xaccess;
		this.stopped = false;
		console.log("automation initialized");
	}

	async next(allow_interval=true) {
		let current_activity_name="";
		const do_activity = async (interval) => {
			console.log("doing automation");
			const activity_id = await loadNextActivity(this.token, this.xaccess);
			if(!activity_id) return;

		};

		return {
			name: current_activity_name,
			do: do_activity
		};
	}
}

module.exports = {Automation};
