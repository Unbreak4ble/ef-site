
function jsonError(res, code, message, exception) {
	let json = {
		message: message,
		error: exception
	};
	res.status(code).send(JSON.stringify(json));
}

module.exports = {
	jsonError
};
