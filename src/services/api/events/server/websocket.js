const ws = require("ws");
const lib_token = require("../static/utils/token.js");
const {fetchUserSessions, compare, continousDiff} = require("./utils");

function con(client){
	let sessions = [], userId;
	client.on("message", async function(msg){
		let json = {token: ""};
		try{
			json = JSON.parse(msg);
		}catch{}
		if(!json.token){
			if(userId == void 0) client.close();
			return;
		}
		else{
			userId = lib_token.decode_jwt(json.token).userId;

			continousDiff(userId, (content) => {
				const refact = {...content};
				delete refact.token;
				console.log("sending change");
				client.send(JSON.stringify(refact));
			});
		}
	})
}

function run(http_server) {
	const server = new ws.Server({ server: http_server, path: "/api/events"})
	server.on("connection", con);
}

module.exports = run;
