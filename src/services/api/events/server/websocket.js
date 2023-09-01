const ws = require("ws");

function con(client){
	client.on("message", function(msg){
		let json = {};
		try{
			json = JSON.parse(msg);
		}catch{}
	})
}

function run(http_server) {
	const server = new ws.Server({ server: http_server, path: "/api/events"})
	server.on("connection", con);
}

module.exports = run;
