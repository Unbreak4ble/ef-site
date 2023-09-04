const lib_sessions = require("../static/redis/sessions.js");
const lib_users = require("../static/redis/users.js");
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
        return sessions;
}

function compare(old, now) {
        let diff=false, points=[];
        for(let i=0; i<now.length; i++){
                let old_session = old[i];
                let now_session = now[i];

                if(old_session == void 0){
                        points.push(now_session[0]);
                        diff=true;
                        continue;
                };

                for(let key in now_session[0]){
                        if(old_session[0][key] != now_session[0][key]){
                                console.log(old_session[0][key]);
                                points.push(now_session[0]);
                                diff = true;
                                break;
                        }
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

