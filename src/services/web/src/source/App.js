import './styles.css';
import React from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


function loadSessions() {
	return [
			{name: "sample", working: false, completedSteps: 10},
			{name: "sample again"}
	];
}

function Sessions(){
	return loadSessions().map(ss => (
		<TableRow>
			<TableCell>{ss.name}</TableCell>
		</TableRow>
	));	
}

class Menu extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		/*
		return (
			<div className="main_container">
				<table className="Table">
					<tr>
						<th>Names</th>
						<th>Status</th>
					</tr>
					<Sessions/>
				</table>
			</div>
		);*/
		return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Dessert (100g serving)</TableCell>
            <TableCell align="right">Calories</TableCell>
            <TableCell align="right">Fat&nbsp;(g)</TableCell>
            <TableCell align="right">Carbs&nbsp;(g)</TableCell>
            <TableCell align="right">Protein&nbsp;(g)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        	<Sessions/>
				</TableBody>
      </Table>
    </TableContainer>
  	);
	}
}

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
					<li onClick={ () => change_spa(spa, "acc") } >Account</li>
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
