const { createClient } = require("redis");
const token = require("./token.js"); 

const init_client = () => new Promise(async resolve => {
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

const session_append = async (client, name, value) => {
	const sessions = await client.get("session");
	let session_json = JSON.parse(sessions).sessions;
	session_json.push({id: name, value: value});
	let sessions_back = JSON.stringify(session_json);
	console.log("added");
	await client.set("session", sessions_back);
};

const session_delete = async (client, name) => {
	const sessions = await client.get("session");
	let session_json = JSON.parse(sessions).sessions;
	
	for(let ss in session_json){
		let session = session_json[ss];
		if(session.id == name)
			delete session_json[ss];
	}

	let sessions_back = JSON.stringify(session_json);
	await client.set("session", sessions_back);
};

const session_get = async (client, name) => {
	const sessions = await client.get("session");
	let session_json = JSON.parse(sessions).sessions;
	
	for(let ss in session_json){
		let session = session_json[ss];
		if(session.id == name)
			return session.value;
	}
	return null;
};


module.exports = {init_client, session_append, session_delete, session_get}
