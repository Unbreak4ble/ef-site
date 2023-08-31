const jwt_encode = require('jwt-encode');
const jwt_decode = require('jwt-decode');
const fs = require("fs");
const crypto = require("crypto");
const { calcDate } = require("./utils.js");

function get_secret() {
	const content = fs.readFileSync("./key.pem", "utf8");
	return Buffer.from(content, "utf8").toString("hex");
}

function encode_hmac(message="", {cipher="sha256", key}){
	return crypto.createHmac(cipher, key).update(message).digest("base64url");
}

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

function encode_jwt(data, header={"alg": "HS256", "typ": "JWT"}){
	const date = Math.floor(new Date().getTime()/1000);
	const increase_time = 60*60*24; // 1 day
	data = {...data, iat: date, exp: date+increase_time};
	return jwt_encode(data, get_secret(), header);
}

function decode_jwt(token) {
	return jwt_decode(token, get_secret());
}

function is_expired(token) {
	if(!is_verified(token))
		return true;
	const [,payload] = token.split(".");
	const decoded = JSON.parse(atob(payload));
	const current_time = Math.floor(new Date().getTime()/1000);
	return (payload.exp - current_time) < 0;
}

function is_verified(token) {
	const [header, payload, src_signature] = token.split(".");
	const dst_signature = encode_hmac(header + "." + payload, {key: get_secret()});
	return src_signature == dst_signature;
}

function is_all_ok(token) {
	const expired = is_expired(token);
	return expired != true;
}

module.exports = {ascii_range, rand_range, rand_id, encode_jwt, decode_jwt, is_verified, get_secret, is_expired, is_all_ok}
