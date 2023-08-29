import React, {useState, useEffect} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { loadSessions } from "./utils.js";

function Sessions() {
	const [sessions, setSessions] = useState([]);
	
	useEffect(() => {
  loadSessions().then(x => {
		setSessions(x.map(ss => 
			(
   	  	<TableRow>
 	    		<TableCell>{ss.name}</TableCell>
		    </TableRow>
  		)
		));
	});
	}, []);
	
	return (
		<>
		{sessions}
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
            <TableCell align="right">Time Left</TableCell>
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
