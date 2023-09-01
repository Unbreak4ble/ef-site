const { createClient } = require("redis");

class Crud {
	constructor() {
		this.client = {};
	}
	
	connect = async() => new Promise(async resolve => {
        const client = createClient({
                url: "redis://redis_server"
        });
        let connected = false;
        client.on("ready", () => connected = true);

        await client.connect();
				this.client = client;
        resolve(connected);
	});
	
	handleKey = (name) => void(this.key = name);

	set = async (value) => {
		const client = this.client;
		await client.set(this.key, value);
	};

	remove = async () => {
		const client = this.client;
		await client.del(this.key);
	};

	get = async (key) => {
		const client = this.client;
		let values = null;
		if(key)
			values = JSON.parse(await client.get(this.key))[key];
		else
			values = JSON.parse(await client.get(this.key));
		return values;
	};

	filter = async (key, opts) => {
		const client = this.client;
    const values = await client.get(this.key);
		try{
	    let values_json={};
			if(key)
				values_json = JSON.parse(values)[key];
			else
				values_json = JSON.parse(values);

    	for(let ss in values_json){
  	  	let value = values_json[ss];
	      let eqs=0;
      	for(let key in opts){
    	   	if(value[key] == opts[key])
  	      	++eqs;
	        }
      	  if(eqs == Object.keys(opts).length){
    	    	return value;
  	      }
	    }
		}catch{}
    return null;
	}

	exists = async() => {
		const client = this.client;
		const res = await client.get(this.key);
		return !!res;
	}
};

module.exports = {Crud}
