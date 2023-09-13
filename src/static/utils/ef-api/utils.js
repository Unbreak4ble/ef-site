const axios = require("axios");

async function request(url, method, headers, data){
  const response = await new Promise(resolve => axios({
    url: url,
    method: method,
    headers: headers,
  	data: data
  }).then(res => resolve(res)).catch(error => resolve({})));
	return response;
}

function randGen(a,b){
	return Math.floor(Math.random() * (b - a + 1) + a);
}

function measureActTime(headers, actID){
	headers["x-request-id"] = (new Date()).getTime();
	return new Promise(res => loadActivity(headers, actID).then(cb => {
		try{
    const actID2 = cb[0].activityContent.id;
    loadActivity(headers, actID2).then(cb => {
			cb = cb[0];
			let time = 1, mode=0;
			if(cb.content.video && cb.content.scripts){
				let vtime = cb.content.scripts[cb.content.scripts.length-1].endTime;
				vtime = +vtime.split(":")[1];
				time += Math.round((vtime+randGen(0, vtime))/60);
			}else if(cb.content.presentations){
				let i=-1;
				let ptime = Array(cb.content.presentations.length).fill(0).map((x,i)=>cb.content.presentations[i].text).join("").length/60;
				time += Math.round(ptime/60 + randGen(ptime/3, ptime)/60);
				mode = 1;
			}else{
				time += Math.round(randGen(60, 180)/60);
			}
			return res([time+Math.round(randGen(30, 120)/60), mode]);
		});
		}catch{
			return res([Math.round(randGen(60, 180)/60), 0]);
		}
	}));
}

module.exports = {randGen, measureActTime, request};
