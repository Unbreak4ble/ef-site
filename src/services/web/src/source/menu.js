import React, {useState, useEffect, useRef} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { loadSessions, handleEvent, websocket, get_time, calcDate, loadCookies, getJobInfo } from "./utils.js";


class Sessions extends React.Component {
	state = {
		sessions: []
	}

	constructor({pushEvent}){
		super();
		const upgrade = async () => {
       for(let i=0; i<this.state.sessions.length; i++){
					switch(this.state.sessions[i].job_status){
						case 0:
							this.state.sessions[i].status = "stopped"
						break;
						case 1:
							this.state.sessions[i].status = "running"
						break;
						case 2:
							this.state.sessions[i].status = "crashed"
						break;
						default:
							this.state.sessions[i].status = "?"
						break;
				}
					if(+this.state.sessions[i].token_expiry - get_time() > 0){
	          let [days, hours, mins, secs] = calcDate(get_time(), +this.state.sessions[i].token_expiry);
  	        this.state.sessions[i].token_expiry_time = `${hours}:${mins}:${secs}`;
					}else{
						this.state.sessions[i].token_expiry_time = `00:00:00`;
					}
  				if(this.state.sessions[i].job_status != 1) {
						continue;
					}

	        let [days, hours, mins, secs] = calcDate(+this.state.sessions[i].begin_time, get_time());
        	this.state.sessions[i].elapsed_time = `${days} / ${hours}:${mins}:${secs}`;
     		}
				this.setState(this.state);
		};

		loadSessions().then(sessions => {
			this.setState({sessions: sessions});
     	const interval = setInterval(upgrade, 500);
			pushEvent((json) => {
					for(let i=0; i<this.state.sessions.length; i++){
						if(this.state.sessions[i].id == json.id){
							delete json.id;
							Object.assign(this.state.sessions[i], json);
						}
					}
			});
		});
	}
	render() {
		return (
			<>
			{
				this.state.sessions.map(ss => {
					ss.current ??= {};
	   	  	return (<TableRow className="align">
  	   			<TableCell align="left">{ss.username}</TableCell>
						<TableCell align="right">{ss.token_expiry_time}</TableCell>
						<TableCell align="right">{ss.status}</TableCell>
						<TableCell align="right">{ss.elapsed_time}</TableCell>
						<TableCell align="right">{ss.activities_done}</TableCell>
						<TableCell align="right">{ss.current.level_name}</TableCell>
						<TableCell align="right">{ss.current.unit_name}</TableCell>
						<TableCell align="right">{ss.current.lesson_name}</TableCell>
						<TableCell align="right">{ss.current.step_name}</TableCell>
			  	</TableRow>);
				})
			}
			</>
		);
	}
}

class Menu extends React.Component {
        constructor(props) {
          super(props);
					this.pushEvent = props.pushEvent;
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
            <TableCell align="right">level</TableCell>
            <TableCell align="right">unit</TableCell>
            <TableCell align="right">lesson</TableCell>
            <TableCell align="right">step</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        	<Sessions pushEvent={this.pushEvent}/>
        </TableBody>
      </Table>
    </TableContainer>
        );
        }
}

export default Menu;
