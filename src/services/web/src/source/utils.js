import axios from 'axios';
import Cookies from 'js-cookie';
import services from "./services.js";

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

export async function loadSessions(cbe) {
				const api = services["api"];
				console.log("trying: ", api);
				let response;
				try{
					response = (await axios.get("http://"+api+":80/api/sessions", { headers: {
									authorization: loadCookies().token
					}})).data;
					setInterval(()=>{
						for(let s=0; s<response.length; s++){
							let [days, hours, mins, secs] = calcDate(get_time(), +response[s].token_expiry);
							response[s].token_expiry_time = `${hours}:${mins}:${secs}`;
							[days, hours, mins, secs] = calcDate(+response[s].begin_time, get_time());
							response[s].elapsed_time = `${days} / ${hours}:${mins}:${secs}`;
						}
						cbe(response)
					}, 1000);

					setInterval(() => {
						response.map(session => {
							if(!!!session.status) session.status=0;
							++session.status;
						});
						cbe(response);
					}, 1000);
				}catch{}
}

