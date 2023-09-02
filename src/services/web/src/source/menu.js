import React, {useState, useEffect, useRef} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { loadSessions, handleEvent, websocket, get_time, calcDate, loadCookies } from "./utils.js";

class Sessions extends React.Component {
	state = {
		sessions: []
	}

	constructor(){
		super();
		loadSessions().then(sessions => {
			console.log(sessions);
			this.setState({sessions: sessions});
			this.ws = websocket();

			this.ws.onopen= (ev) => {
				console.log("opneded websocket");
				this.ws.send('{"token": "'+loadCookies().token+'"}');
			};

			this.ws.onmessage = (msg) => {
				let json;
				try{
					json = JSON.parse(msg.data);
				}catch{};
				if(json == void 0) return;
				console.log("received", json);
				for(let i=0; i<this.state.sessions.length; i++){
					if(this.state.sessions[i].id == json.id){
						delete json.id;
						Object.assign(this.state.sessions[i], json);
						this.setState(this.state);
					}
				}
			}

     	setInterval(()=>{
       for(let i=0; i<this.state.sessions.length; i++){
          let [days, hours, mins, secs] = calcDate(get_time(), +this.state.sessions[i].token_expiry);
          this.state.sessions[i].token_expiry_time = `${hours}:${mins}:${secs}`;
          [days, hours, mins, secs] = calcDate(+this.state.sessions[i].begin_time, get_time());
        	this.state.sessions[i].elapsed_time = `${days} / ${hours}:${mins}:${secs}`;
     		}
				this.setState(this.state);
    	}, 1000);
		});
		console.log("called");
	}
	render() {
		return (
			<>
			{
				this.state.sessions.map(ss => (
	   	  	<TableRow className="align">
  	   			<TableCell>{ss.username}</TableCell>
						<TableCell>{ss.token_expiry_time}</TableCell>
						<TableCell>{ss.status}</TableCell>
						<TableCell>{ss.elapsed_time}</TableCell>
						<TableCell>{ss.activities_done}</TableCell>
						<TableCell>{ss.current_activity}</TableCell>
			  	</TableRow>
	  		))
			}
			</>
		);
	}
}

class Menu extends React.Component {
        constructor(props) {
                super(props);
        }

        render() {
                return (
    <TableContainer component={Paper} className="Table">
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Account</TableCell>
            <TableCell align="right">Session expiration</TableCell>
            <TableCell align="right">Status</TableCell>
            <TableCell align="right">Elapsed Time</TableCell>
            <TableCell align="right">Activities Done</TableCell>
            <TableCell align="right">Current</TableCell>
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

export default Menu;
