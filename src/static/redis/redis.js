const { createClient } = require("redis");

const setup = () => new Promise(async resolve => {
	const client = createClient({
		url: "redis://redis_server"
	});
	let connected = false;
	client.on("ready", () => connected = true);

	await client.connect();
	
	const methods = {
		connected: connected,
		client: client
	};
	resolve(methods);
});


module.exports = {
	setup
}
