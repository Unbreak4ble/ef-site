import axios from 'axios';
import Cookies from 'js-cookie';
import services from "./services.js";

export function calcDate(min, max){
	const diff = max-min;
	const secs = diff%60;
	const minutes = (diff - secs)/60;
	const min_rest = minutes%60;
	const hours = (minutes - min_rest)/60;
	return [hours, min_rest, secs];
}

export function loadCookies() {
	return Cookies.get();
}

export async function loadSessions() {
				const api = services["api"];
				console.log("trying: ", api);
				let response;
				try{
					response = (await axios({
						url: "http://"+api+":80/api/sessions",
						method: "GET"
					})).data;
				}catch{}
				console.log(response);
				Cookies.set("test", "hello world");
				console.log("cookies: ", loadCookies());
				console.log("date", calcDate(0, 110));
				try{
					let json = JSON.parse(response);
					return json;
				}catch{
					return [];
				}
}

