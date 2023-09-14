const api_utils = require("./api.js");

function stepDone(step_data){
	const summary = step_data.rollUpSummary;
	const percent = summary.percentComplete;
	return percent == 100;
}

async function getCurrentLessonId(token, xaccess){
	let course = (await api_utils.getCurrentLesson(api_utils.mountCredentials(token, xaccess))).data;
	if(!(course && course.length)) return;
	course = course[0];
	const pre_lesson_id = course.studentLesson.id;
	const lesson = (await api_utils.loadLesson(
		api_utils.mountCredentials(token, xaccess),
		pre_lesson_id
	)).data;
	if(!(lesson && lesson.length)) return;
	const templateId = lesson[0].templateLessonId;
	const template_lesson = (await api_utils.loadTemplateLesson(api_utils.mountCredentials(token, xaccess), templateId)).data;
	if(!(template_lesson && template_lesson.length)) return;
	const lesson_id = template_lesson[0].lesson.id;
	return lesson_id;
};

async function loadLessonStepsId(token, xaccess, id){
	let lesson = (await api_utils.loadLesson(
		api_utils.mountCredentials(token, xaccess),
		id
	)).data;
	if(!(lesson && lesson.length)) return;
	const stepsId = lesson[0].children.map(x => x.id);
	return stepsId;
}

async function loadNextActivity(token, xaccess){
	const lesson_id = await getCurrentLessonId(token, xaccess);
	if(!lesson_id) return;
	const stepsId = await loadLessonStepsId(token, xaccess, lesson_id);
	const steps = [];
	for(const stepId of stepsId){
		const step_info = (await api_utils.loadStep(api_utils.mountCredentials(token, xaccess), stepId.split("!")[1])).data[0];
		if(!stepDone(step_info)){
			steps.push(step_info);
		}
	}
	const stepsActivities = await Promise.all(steps.map(async step => {
		let activities_id = step.children
			.map(activity => activity.id)
			.map(async activity_id => {
				const activity = (await api_utils.loadActivity(api_utils.mountCredentials(token, xaccess), activity_id.split("!")[1])).data[0];
				const complete = activity.score == 100;
				if(!complete)
					return activity_id;
			});
		activities_id = await Promise.all(activities_id);
		activities_id = activities_id.filter(x => x);
		const data = {id: step.id, activities: activities_id};
		return data;
	}));
	if(!(stepsActivities.length && stepsActivities[0].activities.length))
		return undefined;
	return stepsActivities[0].activities[0];
}

class Automation {
	constructor(token, xaccess) {
		this.token = token;
		this.xaccess = xaccess;
		this.stopped = false;
	}

	async next(allow_interval=true) {
		let current_activity_name="";
		const do_activity = async (interval) => {
			console.log("doing automation");
			let activity_id = await loadNextActivity(this.token, this.xaccess);
			if(!activity_id) return;
			activity_id = activity_id.split("!")[1];
			const score = 100;
			const minutes_spend = 1;
			const mode = 2;
			const pushed_result = await api_utils.pushData(api_utils.mountCredentials(this.token, this.xaccess), api_utils.mountPayloadComplete(activity_id, score, minutes_spend, mode));
			console.log("next activity:", activity_id, pushed_result.data);
		};

		return {
			name: current_activity_name,
			do: do_activity
		};
	}
}

module.exports = {Automation};
