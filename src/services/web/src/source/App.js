import './styles.css';

function NavBar() {
	return (
		<div className="navbar">
			<div></div>
			<nav>
				<ul>
					<li>Account</li>
					<li>Automation</li>
					<li>Cheat</li>
				</ul>
			</nav>
		</div>
	);
}

function App() {
  return (
  	<NavBar/>
	);
}

export default App;
