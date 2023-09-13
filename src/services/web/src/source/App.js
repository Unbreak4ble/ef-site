import './styles.css';
import React from "react";
import Menu from "./menu.js"
import Account from "./account.js";
import {validateUser, loadCookies, initEvents} from "./utils";
import Login from "./login.js"

function change_spa([content, setContent], events, type) {
	if(type == "acc")
		setContent(<Account pushEvent={events}/>);
	else if(type == "menu")
		setContent(<Menu pushEvent={events}/>);
}

function NavBar({ spa, events }) {
	return (
		<div className="navbar">
			<div></div>
			<nav>
				<ul>
					<li onClick={ () => change_spa(spa, events, "acc") } >Account<div></div>
					</li>
					<li onClick={ () => change_spa(spa, events, "auto") } >Automation<div></div></li>
					<li onClick={ () => change_spa(spa, events, "cheat") } >Cheat<div></div></li>
					<li onClick={ () => change_spa(spa, events, "menu") } >Menu<div></div></li>
				</ul>
			</nav>
		</div>
	);
}

async function checkUser() {
	const token = loadCookies().token;
	if(token == void 0 || !token.length)
		return false;

	return (await validateUser(token));
}

function MainPage({events}) {
	const spa = React.useState(<Menu pushEvent={events}/>);
	const [content, setContent] = spa;
	return (
		<>
  		<NavBar spa={ spa } events={events}/>
			<div className="spa"> { content }</div>
		</>
	);
}

function App() {
	const spa = React.useState(<Menu/>);
	const [content, setContent] = spa;
	const [body, setBody] = React.useState(<a>loading...</a>);
	const [ws_event, renewEvent] = React.useState();
	
	React.useEffect(() => {
		document.title = "ef automation";
		const ws_server = initEvents();
		renewEvent(ws_server);
		const eventPushClient = ws_server.pushClient;
		(async() => {
			const status = await checkUser();
			if(status){
				setBody(<MainPage events={eventPushClient}/>);
			}else{
				setBody(<Login/>);
			}
		})();
	}, []);

	return (
		<>
			{body}
		</>
	);
}

export default App;
