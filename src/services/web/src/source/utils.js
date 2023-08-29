import axios from 'axios';
import Cookies from 'js-cookie';
import services from "./services.js";

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
				try{
					let json = JSON.parse(response);
	        return [
          	{name: "sample", expiry: 10, working: false, completedSteps: 10},
            {name: "sample again"}
        	];
				}catch{
					return [];
				}
}

