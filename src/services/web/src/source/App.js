import './styles.css';
import React from "react";
import Menu from "./menu.js"

class Account extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div>
			</div>
		);
	}
}

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
					<li onClick={ () => change_spa(spa, "acc") } >
					<div></div>
					<a>Account</a>
					</li>
					<li onClick={ () => change_spa(spa, "auto") } >Automation</li>
					<li onClick={ () => change_spa(spa, "cheat") } >Cheat</li>
					<li onClick={ () => change_spa(spa, "menu") } >Menu</li>
				</ul>
			</nav>
		</div>
	);
}

function App() {
	const spa = React.useState(<Menu/>);
	const [content, setContent] = spa;
  return (
		<>
  		<NavBar spa={ spa }/>
			<div className="spa"> { content }</div>
		</>
	);
}

export default App;
