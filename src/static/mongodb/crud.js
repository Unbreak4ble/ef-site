const {MongoClient} = require('mongodb');

const mongodb_url = "mongo://root:root@mongodb";

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

	remove = async (query) => {
		const client = this.collection;
		await client.deleteOne(query);
	};

	get = async (query) => {
		const client = this.collection;
		const result = await client.findOne(query);
		return result;
	};

	filter = async (query) => {
		const client = this.collection;
		const result = await client.find(query);
		return result;
	}
};

module.exports = {Crud}

