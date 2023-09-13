const token = require("./token.js");

function generate_payload(token_jwt) {
	let metadata = {
		token_expiry: 0
	};
	
	try{
		const payload = token.decode_jwt(token_jwt);
		metadata.token_expiry = payload.exp;
	}catch{}
	
	return metadata;
}

module.exports = { generate_payload }
