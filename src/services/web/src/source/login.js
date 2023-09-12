import "./login_styles.css";
import {setCookie, loginApi, registerApi} from "./utils.js";
import {useState, useRef} from "react";

async function login_action(username, password, setMessage){
	setMessage("");
	const result = await loginApi(username, password);
	if(result.status === "error"){
		setMessage(result.content);
		return;
	}
	setMessage("redirecting...");
	setCookie("token", result.content);
	window.location.reload();
}

async function register_action(username, password, setMessage){
	const result = await registerApi(username, password);
	if(result.status === "error"){
		setMessage(result.content);
		return;
	}
	setMessage("registered! Redirecting...");
	setCookie("token", result.content);
	window.location.reload();
}

function switchInterface(loginVisibility, setRegister, setLogin) {
	const registerVisibility = loginVisibility === "flex" ? "none" : "flex";
	setLogin(registerVisibility);
	setRegister(loginVisibility);
}

function Login() {
	const username_login_ref = useRef();
	const password_login_ref = useRef();
	const username_register_ref = useRef();
	const password_register_ref = useRef();
	const [messageRegisterState, setRegisterMessage] = useState();
	const [messageLoginState, setLoginMessage] = useState();
	const [login_style, setLoginStyle] = useState("flex");
	const [register_style, setRegisterStyle] = useState("none");
	
	return (
		<div className="centerFlexDiv">
			<div className="Forms">
				<div className="Form LoginForm" style={{display: login_style}}>
					<div className="eficon"></div>
					<div className="input_div">
						<input ref={username_login_ref} placeholder="username" id="username_input"/>
					</div>
					<div className="input_div">
						<input ref={password_login_ref} placeholder="password" id="password_input"/>
					</div>
					<div className="messageInfo"><a>{messageLoginState}</a></div>
					<button className="buttonForm" onClick={() => login_action(username_login_ref.current.value, password_login_ref.current.value, setLoginMessage)}>Login</button>
					<div className="switchMessage">
						<a>dont have an account? </a>
						<a className="buttonToSwitch" onClick={() => switchInterface(login_style, setRegisterStyle, setLoginStyle)}>Click here to register</a>
					</div>
				</div>

				<div className="Form RegisterForm" style={{display: register_style}}>
					<div className="eficon"></div>
					<div className="input_div">
						<input ref={username_register_ref} placeholder="username" id="username_input"/>
					</div>
					<div className="input_div">
						<input ref={password_register_ref} placeholder="password" id="password_input"/>
					</div>
					<div className="messageInfo"><a>{messageRegisterState}</a></div>
					<button className="buttonForm" onClick={() => register_action(username_register_ref.current.value, password_register_ref.current.value, setRegisterMessage)}>Register</button>
					<div className="switchMessage">
						<a>have an account? </a>
						<a className="buttonToSwitch" onClick={() => switchInterface(login_style, setRegisterStyle, setLoginStyle)}>Click here to login</a>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Login;
