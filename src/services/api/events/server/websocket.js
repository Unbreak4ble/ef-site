const ws = require("ws");

function con(client){
	client.on("message", function(msg){
		let json = {token: ""};
		try{
			json = JSON.parse(msg);
		}catch{}

		console.log(json);
	})
}

function run(http_server) {
	const server = new ws.Server({ server: http_server, path: "/api/events"})
	server.on("connection", con);
}

module.exports = run;
