const lib_sessions = require("../static/mongodb/sessions.js");
const lib_users = require("../static/mongodb/users.js");
const lib_token = require("../static/utils/token.js");

async function fetchUserSessions(userId) {
        const client_users = new lib_users.Client();
        await client_users.connect();
        const user_info = await client_users.session_get(userId);
        if(user_info == void 0) {
                return [];
        };
        let sessions_id = user_info.sessions || [];
        let sessions = [];

        const client_sessions = new lib_sessions.Sessions();
        await client_sessions.connect();
        for(let session_id of sessions_id){
                sessions.push(await client_sessions.get(session_id));
        }
				client_users.close();
				client_sessions.close();
        return sessions;
}

function compare_recursive(a, b) {
	let diff=false, points;
  if(Array.isArray(a) && Array.isArray(b)){
    points = [];
    for(let i=0; i<b.length; i++){
      if(a[i] == void 0){
        points = points.concat(b.slice(i, b.length));
        diff=true;
        break;
      }
      let [a_diff, b_points] = compare_recursive(a[i], b[i]);
      if(a_diff == true){
        diff = true;
        points.push(b_points);
      }else{
        points.push(undefined);
      }
    }
  }else if(a instanceof Object && b instanceof Object){
    points = {};
    for(let key in b){
      if(a[key] == void 0){
        Object.assign(points, b);
        diff=true;
        break;
      }
      let [a_diff, b_points] = compare_recursive(a[key], b[key]);
      if(a_diff == true){
        diff = true;
        points[key] = b_points;
      }
    }
  }else{
    diff = a != b;
    if(diff){
      points = b;
    }
  }
  return [diff, points];
}

function compare(old, now) {
  let diff=false, points=[];
	for(let i=0; i<now.length; i++){
    let old_session = old[i];
    let now_session = now[i];

    if(old_session == void 0){
     	points.push(now_session);
      diff=true;
    	continue;
    };
		delete old_session["_id"];
		delete now_session["_id"];
		
		if(compare_recursive(old_session, now_session)[0]){
			diff = true;
			points.push(now_session);
		}
	}

  return [diff, points];
}

async function continousDiff(userId, callback){
 				let old_sessions = [];
        console.log("new user sessions request");
        const interval = setInterval(async () => {
                let now_sessions = await fetchUserSessions(userId);
                const [diff, point] = compare(old_sessions, now_sessions);
                if(diff){
                  old_sessions = now_sessions;
                	for(let session of point)
                  	callback(session);
                }
        }, 1000);
}

module.exports = { continousDiff, fetchUserSessions, compare};
