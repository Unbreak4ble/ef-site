const ws = require("ws");
const lib_token = require("../static/utils/token.js");
const {fetchUserSessions, compare, continousDiff} = require("./utils");

let server;

function sendTo(client, message){
	if(client.readyState !== ws.WebSocket.OPEN) return;
	client.send(message.toString());
}

function handleBroadcast(message){
	server.clients.forEach(client => sendTo(client, message));
}

function con(client){
	let sessions = [], userId, broadcast=false;
	client.on("message", async function(msg){
		if(broadcast){
			handleBroadcast(msg);
			return;
		}

		let json = {token: ""};
		try{
			json = JSON.parse(msg);
		}catch{}

		if(json.broadcast == true){
			broadcast = true;
			return;
		}

		if(!json.token){
			if(userId == void 0) client.close();
			return;
		}
		else
		{
			userId = lib_token.decode_jwt(json.token).userId;

			continousDiff(userId, (content) => {
				const refact = {...content};
				delete refact.token;
				client.send(JSON.stringify(refact));
			});
		}
	})
}

function run(http_server) {
	server = new ws.Server({ server: http_server, path: "/api/events"})
	server.on("connection", con);
}

module.exports = run;
