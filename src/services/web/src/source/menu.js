import React, {useState, useEffect, useRef} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { loadSessions, handleEvent, websocket } from "./utils.js";

function Sessions() {
	const sessionsState = useState([]);
	const [sessions, setSessions] = sessionsState;

	useEffect(() => {
	  loadSessions().then(x => {
			setSessions(x);
			handleEvent(x, setSessions);
		});
	}, []);
	console.log("updated");	
	return (
		<>
		{
			sessions.map(ss => (
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
