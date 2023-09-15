const api_utils = require("./api.js");

function stepDone(step_data){
	const summary = step_data.rollUpSummary;
	const percent = summary.percentComplete;
	return percent == 100;
}

async function getCurrentLessonId(token, xaccess){
	const credentials = api_utils.mountCredentials(token, xaccess);
	let course = (await api_utils.getCurrentLesson(credentials)).data;
	if(!(course && course.length)) return;
	course = course[0];
	const pre_lesson_id = course.studentLesson.id;
	const lesson = (await api_utils.loadLesson(
		credentials,
		pre_lesson_id
	)).data;
	if(!(lesson && lesson.length)) return;
	const templateId = lesson[0].templateLessonId;
	const template_lesson = (await api_utils.loadTemplateLesson(credentials, templateId)).data;
	if(!(template_lesson && template_lesson.length)) return;
	const lesson_id = template_lesson[0].lesson.id;
	return lesson_id;
};

async function loadLessonStepsId(token, xaccess, id){
	const credentials = api_utils.mountCredentials(token, xaccess);
	let lesson = (await api_utils.loadLesson(
		credentials,
		id
	)).data;
	if(!(lesson && lesson.length)) return;
	const stepsId = lesson[0].children.map(x => x.id);
	return stepsId;
}

async function loadNextActivity(token, xaccess){
	const credentials = api_utils.mountCredentials(token, xaccess);
	const lesson_id = await getCurrentLessonId(token, xaccess);
	if(!lesson_id) return;
	const stepsId = await loadLessonStepsId(token, xaccess, lesson_id);
	const steps = [];
	for(const stepId of stepsId){
		const step_info = (await api_utils.loadStep(credentials, stepId.split("!")[1])).data[0];
		if(!stepDone(step_info)){
			steps.push(step_info);
		}
	}
	const stepsActivities = await Promise.all(steps.map(async step => {
		let activities_id = step.children
			.map(activity => activity.id)
			.map(async activity_id => {
				let activity = (await api_utils.loadActivity(credentials, activity_id.split("!")[1])).data;
				if(!(activity && activity.length)) return;
				activity = activity[0];
				const complete = activity.score == 100;
				if(!complete)
					return activity_id;
			});
		activities_id = await Promise.all(activities_id);
		activities_id = activities_id.filter(x => x);
		const data = {id: step.id, name: step.stepName, activities: activities_id};
		return data;
	}));
	if(!(stepsActivities.length && stepsActivities[0].activities.length))
		return [];
	return [stepsActivities[0].activities[0], stepsActivities[0].name];
}

async function loadCurrentNames(token, xaccess){
	const credentials = api_utils.mountCredentials(token, xaccess);
	let current_courses = (await api_utils.loadCurrentCourse(credentials)).data;
	if(!(current_courses && current_courses.length)) 
		return [];
	current_courses = current_courses[0];
	const current_level = (((await api_utils.queryRequest(credentials, current_courses.studentLevel.id)).data || [])[0] || {}).levelName;
	const current_unit = (((await api_utils.queryRequest(credentials, current_courses.studentUnit.id)).data || [])[0] || {}).unitName;
	const current_lesson = (((await api_utils.queryRequest(credentials, current_courses.studentLesson.id)).data || [])[0] || {}).lessonName;

	return [current_level, current_unit, current_lesson];
}

class Automation {
	constructor(token, xaccess) {
		this.token = token;
		this.xaccess = xaccess;
		this.stopped = false;
	}

	async next(allow_interval=true) {
		console.log("next");
		const [current_level_name, current_unit_name, current_lesson_name] = await loadCurrentNames(this.token, this.xaccess);
		const logs = [];
		const pushLog = (msg, ...args) => logs.push(msg, ...args);
		let [activity_id, current_step_name] = await loadNextActivity(this.token, this.xaccess);
		const do_activity = async (interval) => {
			if(!activity_id) return;
			pushLog("doing automation");
			activity_id = activity_id.split("!")[1];
			const score = 100;
			const minutes_spend = 1;
			const mode = 2;
			//const pushed_result = await api_utils.pushData(api_utils.mountCredentials(this.token, this.xaccess), api_utils.mountPayloadComplete(activity_id, score, minutes_spend, mode));
			pushLog("next activity:", activity_id);
		};

		return {
			current: {
				lesson_name: current_lesson_name,
				step_name: current_step_name,
				unit_name: current_unit_name,
				level_name: current_level_name,
			},
			logs: logs,
			do: do_activity
		};
	}
}

module.exports = {Automation};
