const {request} = require("./utils.js");

const urlencoded_format = "application/x-www-form-urlencoded; charset=UTF-8";
const applicationjson_format = "application/json; charset=UTF-8";

const API_QUERY = {
	lesson: "student_lesson",
	course: "student_course_enrollment",
	step: "student_step",
	activity_map: "pc_student_lesson_map",
	activity_progress: "student_activity_progress",
};

const API = {
				pushData: () => ({url: "https://learn.corporate.ef.com/api/school-proxy/v1/commands/activity/complete", method: "POST"}),
				troop: () => ({url: "https://learn.corporate.ef.com/api/school-proxy/v1/troop?c=countrycode=br|culturecode=en|partnercode=Corp|studentcountrycode=br|languagecode=en|siteversion=18-1|devicetypeid=1|productid=100", method: "POST"}),
};

const API_PAYLOADS = {
				troop: {
					levels: (plans) => `blurb!150652|blurb!450018|blurb!450019|ccl!"school.e12.showUnitOverview"|blurb!150652|blurb!450016|blurb!450311|blurb!458008|blurb!458009|blurb!461321|blurb!461322|blurb!569826|blurb!569827|blurb!634432|blurb!634433|blurb!634434|blurb!634435|blurb!634436|blurb!634437|blurb!634438|blurb!634439|blurb!634440|student_enrollable_courses!*.items.children.progress|ccl!"school.AsrServerAddress"|${plans[plans.length-1]}|`,
					current_lesson: () => "student_course_enrollment!current",
					plans: () => `blurb!450052|blurb!443583|blurb!150622|blurb!443583|blurb!450052|blurb!450051|blurb!450316|blurb!730245|blurb!462940|blurb!463688|blurb!463704|ccl!"school.courseware.e12.enableTTS"|campus_student_unit_studyplan!current.studyPlan.items|ccl!'school.activity.interaction.sampleRate'`,
					lesson_info: (id) => `${API_QUERY.lesson}!${id}`,
					lesson_map_info: (id) => API_QUERY.activity_map + "!" + id,
					course_info: () => mountQueryParam(API_QUERY.course, "current"),
					step_info: (id) => API_QUERY.step + "!" + id,
					activity_info: (id) => API_QUERY.activity_progress+"!"+id,
				}
}

const mountHeader = (token, xaccess) => ({
	"accept": "*/*",
	"accept-encoding": "gzip, deflate, br",
	"accept-language": "en-US,en;q=0.9,pt;q=0.8",
	"authorization": "bearer "+xaccess, 
	"content-type": applicationjson_format,
	"cookie": "", 
	"origin": "https://learn.corporate.ef.com",
	"referer": "https://learn.corporate.ef.com/iframed-study/studyplan/",
	"sec-ch-ua": '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
	"sec-ch-ua-mobile": "?0",
	"sec-ch-ua-platform": '"Linux"',
	"sec-fetch-dest": "empty",
	"sec-fetch-mode": "cors",
	"sec-fetch-site": "same-origin",
	"user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
	"x-ef-access": token,
	"x-request-id": (new Date).getTime(),
	"x-requested-with": "XMLHttpRequest"
});

function mountQueryParam(property, value){
	return property + "!" + value;
}

function mountQuery(queries){
	return queries.join("|");
}

function mountCredentials(token, xaccess){
	return {token: token, xaccess: xaccess};
}

function queryFormat(payload){
	return {q: payload};
}

function mountPayloadComplete(activity_id, score, minutes_spend, mode){
	return {
		"studentActivityId":activity_id,
		"score":score,
		"minutesSpent":minutes_spend,
		"studyMode":mode
	};
}

async function getPlans(credentials){
	const {token, xaccess} = credentials;
	const {url, method} = API.troop();
	const response = await request(url, method, mountHeader(token, xaccess), queryFormat(API_PAYLOADS.troop.plans()));
	return response;
}

async function getCurrentLesson(credentials){
	const {token, xaccess} = credentials;
	const {url, method} = API.troop();
	const headers = mountHeader(token, xaccess);
	headers["content-type"] = urlencoded_format;
	const response = await request(url, method, headers, queryFormat(API_PAYLOADS.troop.current_lesson()));
	return response;
}

async function loadLesson(credentials, id){
	const {token, xaccess} = credentials;
	const {url, method} = API.troop();
	const headers = mountHeader(token, xaccess);
	headers["content-type"] = urlencoded_format;
	const response = await request(url, method, headers, queryFormat(API_PAYLOADS.troop.lesson_info(id)));
	return response;
}

async function loadTemplateLesson(credentials, id){
	const {token, xaccess} = credentials;
	const {url, method} = API.troop();
	const headers = mountHeader(token, xaccess);
	headers["content-type"] = urlencoded_format;
	const response = await request(url, method, headers, queryFormat(API_PAYLOADS.troop.lesson_map_info(id)));
	return response;
}

async function loadCurrentCourse(credentials){
	const {token, xaccess} = credentials;
	const {url, method} = API.troop();
	const headers = mountHeader(token, xaccess);
	headers["content-type"] = urlencoded_format;
	const response = await request(url, method, headers, queryFormat(API_PAYLOADS.troop.course_info()));
	return response;
}

async function loadUnit(credentials, id){
	const {token, xaccess} = credentials;
	const {url, method} = API.troop();
	const response = await request(url, method, mountHeader(token, xaccess), queryFormat(id));
	return response;
}

async function loadLevels(credentials){
	const {token, xaccess} = credentials;
	const {url, method} = API.troop();
	const plans = await getPlans(credentials);
	const response = await request(url, method, mountHeader(token, xaccess), queryFormat(API_PAYLOADS.troop.levels(plans)));
	return response;
}

async function loadStep(credentials, id){
	const {token, xaccess} = credentials;
	const {url, method} = API.troop();
	const plans = await getPlans(credentials);
	const headers = mountHeader(token, xaccess);
	headers["content-type"] = urlencoded_format;
	const response = await request(url, method, headers, queryFormat(API_PAYLOADS.troop.step_info(id)));
	return response;
}

async function loadActivity(credentials, id){
	const {token, xaccess} = credentials;
	const {url, method} = API.troop();
	const headers = mountHeader(token, xaccess);
	headers["content-type"] = urlencoded_format;
	const response = await request(url, method, headers, queryFormat(API_PAYLOADS.troop.activity_info(id)));
	return response;
}

async function pushData(credentials, payload){
	const {token, xaccess} = credentials;
	const {url, method} = API.pushData();
	const headers = mountHeader(token, xaccess);
	const response = await request(url, method, headers, payload);
	return response;
}

module.exports = {
	mountHeader,
	mountPayloadComplete,
	mountCredentials,
	API,
	API_PAYLOADS,
	getPlans,
	getCurrentLesson,
	loadLesson,
	loadTemplateLesson,
	loadCurrentCourse,
	loadUnit,
	loadLevels,
	loadStep,
	loadActivity,
	pushData
};
