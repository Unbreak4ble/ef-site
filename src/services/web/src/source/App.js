import './styles.css';
import React from "react";
import Menu from "./menu.js"
import Account from "./account.js";
import {validateUser} from "./utils";

function change_spa([content, setContent], type) {
	if(type == "acc")
		setContent(<Account/>);
	else if(type == "menu")
		setContent(<Menu/>);
}

function NavBar({ spa }) {
	return (
		<div className="navbar">
			<div></div>
			<nav>
				<ul>
					<li onClick={ () => change_spa(spa, "acc") } >Account<div></div>
					</li>
					<li onClick={ () => change_spa(spa, "auto") } >Automation<div></div></li>
					<li onClick={ () => change_spa(spa, "cheat") } >Cheat<div></div></li>
					<li onClick={ () => change_spa(spa, "menu") } >Menu<div></div></li>
				</ul>
			</nav>
		</div>
	);
}

async function checkUser(spa) {
	const [content, setContent] = spa;
}

function App() {
	const spa = React.useState(<Menu/>);
	const [content, setContent] = spa;
	checkUser(spa);

	return (
		<>
  		<NavBar spa={ spa }/>
			<div className="spa"> { content }</div>
		</>
	);
}

export default App;
