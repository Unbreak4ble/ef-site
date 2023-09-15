const {MongoClient} = require('mongodb');

const username = "root";
const password = "root";
const hostname = "mongodb";
const mongodb_url = "mongodb://"+username+":"+password+"@"+hostname;

class Crud {
	constructor() {
		this.client = new MongoClient(mongodb_url);
	}
	
	connect = async () => {
		await this.client.connect();
	};

	close = async () => {
		await this.client.close();
	}

	handledb = async (name) => {
		this.db_name = name;
		this.db = this.client.db(name);
	};
	
	handleCollection = (name) => {
		this.collection_name = name;
		this.collection = this.db.collection(name);
	};

	add = async(obj) => {
		const client = this.collection;
		await client.insertOne(obj);
	}

	set = async (query, obj) => {
		const client = this.collection;
		await client.replaceOne(query, obj);
	};

	update = async(query, obj, options={upsert:true}) => {
		const client = this.collection;
		const exists = (await this.get(query)) != void 0;
		if(!exists) 
			return false;
			
		await client.updateOne(query, obj, options);

		return true;
	};

	remove = async (query) => {
		const client = this.collection;
		await client.deleteMany(query);
	};

	get = async (query) => {
		const client = this.collection;
		const result = await client.findOne(query);
		return result;
	};

	filter = async (query) => {
		const client = this.collection;
		const result = await client.find(query);
		const results = [];
		for await(const doc of result){
			results.push(doc);
		}
		return results;
	}

	track = (query, projection, callback) => {
		const client = this.collection;
		const payload = [
			{ $match: query },
			{ $project: projection }
		];
		const stream = client.watch(payload);
		stream.on("change", callback);
	}
};

module.exports = {Crud}

