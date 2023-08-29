const jwt_encode = require('jwt-encode');
const jwt_decode = require('jwt-decode');

function ascii_range(begin, end){
	const ascii = Array(end - begin).fill((x) => String.fromCharCode(x)).map((func, idx) => func(idx + begin));
	return ascii;
}

function rand_range(min, max){
	return Math.floor(Math.random()*(max-min) + min);
}

function rand_id(len=24){
	const min = 0x30;
	const max = 0x39;
	const ascii = ascii_range(min, max);
	const array = Array(len).fill((x, y) => ascii[rand_range(0, (y-x))]).map((x, y) => x(min, max));
	return array.join("");
}

function encode_jwt(data, header, secret){
	return jwt_encode(data, secret, header);
}

function decode_jwt(token, secret) {
	return jwt_decode(token, secret);
}
