const token = require("./token.js");

function generate_payload(token_jwt) {
	const payload = token.decode_jwt(token_jwt);
	return {
		username: "?",
		token_expiry: payload.exp
	}
}

module.exports = { generate_payload }
