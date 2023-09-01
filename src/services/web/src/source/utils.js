import axios from 'axios';
import Cookies from 'js-cookie';
import useWebSocket from 'react-use-websocket';
import services from "./services.js";
import { useRef } from 'react';

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

export function websocket(sessions, setSessions){
	const service = services["api"];
	console.log("trying connection:", sessions[0]);
	const ws = new WebSocket("ws://"+service+":80/api/events");
	return ws;
}

export async function handleEvent(sessions, setSessions){
	const api = services["api"];
	websocket(sessions, setSessions);
	setInterval(()=>{
		for(let i=0; i<sessions.length; i++){
			let [days, hours, mins, secs] = calcDate(get_time(), +sessions[i].token_expiry);
			sessions[i].token_expiry_time = `${hours}:${mins}:${secs}`;
			[days, hours, mins, secs] = calcDate(+sessions[i].begin_time, get_time());
			sessions[i].elapsed_time = `${days} / ${hours}:${mins}:${secs}`;
		}
		setSessions(sessions);
	}, 1000);
};

export async function loadSessions(cbe) {
	const api = services["api"];
	console.log("trying: ", api);
	let response = [];
	try{
		response = (await axios.get("http://"+api+":80/api/sessions", { headers: {
			authorization: loadCookies().token
		}})).data;
	}catch{}
	return response;
}

