import axios from 'axios';
import Cookies from 'js-cookie';
import useWebSocket from 'react-use-websocket';
import services from "./services.js";
import { useRef } from 'react';
import { API_EVENTS, API_SESSIONS, JOBS_INFO, JOBS_START, JOBS_STOP, API_USERS_VALIDATE } from "./apis.js"

export function calcDate(min, max){
	const diff = max-min;
	const secs = diff%60;
	const minutes = (diff - secs)/60;
	const min_rest = minutes%60;
	const hours = (minutes - min_rest)/60;
	const hour_rest = hours%24;
	const days = (hours - hour_rest)/24;
	return [days, hour_rest, min_rest, secs];
}

export function loadCookies() {
	return Cookies.get();
}

export function get_time(){
	return Math.floor(new Date().getTime()/1000);
}

export function websocket(){
	const service = services["api"];
	const ws = new WebSocket(API_EVENTS);
	return ws;
}

export async function getJobInfo(id) {
	const api = services["api"];
	const response = await axios.get(JOBS_INFO+"?id="+id);
	const response_data = response.data;
	return response_data;
}

export async function handleEvent(sessions, setSessions){
	const api = services["api"];
	console.log(setSessions);
	setInterval(()=>{
		for(let i=0; i<sessions.length; i++){
			let [days, hours, mins, secs] = calcDate(get_time(), +sessions[i].token_expiry);
			sessions[i].token_expiry_time = `${hours}:${mins}:${secs}`;
			[days, hours, mins, secs] = calcDate(+sessions[i].begin_time, get_time());
			sessions[i].elapsed_time = `${days} / ${hours}:${mins}:${secs}`;
		}
	}, 1000);
};

export async function loadSessions(cbe) {
	const api = services["api"];
	console.log("trying: ", api);
	let response = [];
	try{
		response = (await axios.get(API_SESSIONS, { headers: {
			authorization: loadCookies().token
		}})).data;
	}catch{}
	return response;
}

export async function pushSession(token) {
	const data = await new Promise((resolve) => axios({
		method:"POST",
		url: API_SESSIONS,
		headers: {
			"content-type": "application/json",
			authorization: loadCookies().token
		},
		data: {
			token: token
		}
	}).then(() => resolve("added")).catch(() => resolve("failed to add")));
	return data;
}

export async function deleteSession(id) {
	const result = await new Promise(resolve => axios({
		method: "DELETE",
		url: API_SESSIONS,
		headers: {
			"content-type": "application/json",
			authorization: loadCookies().token
		},
		data: {
			id: id
		}
	}).then(() => resolve(true)).catch(() => resolve(false)));
	return result;
}

export async function stopJob(id) {
	const result = await new Promise(resolve => axios({
		method: "POST",
		url: JOBS_STOP,
		headers: {
			"content-type": "application/json",
			authorization: loadCookies().token
		},
		data: {
			id: id
		}
	}).then(() => resolve(true)).catch(() => resolve(false)));
	return result;
}

export async function startJob(id) {
	const result = await new Promise(resolve => axios({
		method: "POST",
		url: JOBS_START,
		headers: {
			"content-type": "application/json",
			authorization: loadCookies().token
		},
		data: {
			id: id
		}
	}).then(() => resolve(true)).catch(() => resolve(false)));
	return result;
}

export async function validateUser(){
		const result = (await axios({
		method: "POST",
		url: API_USERS_VALIDATE,
		headers: {
			"content-type": "application/json"
		},
		data: {
			token: loadCookies().token
		}
	})).data;
	return result === "true";
}
