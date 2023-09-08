import React, {useState, useEffect, useRef, memo, createContext, useContext} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { loadSessions, handleEvent, websocket, get_time, calcDate, loadCookies, getJobInfo, pushSession, deleteSession, startJob, stopJob } from "./utils.js";

const modalContext = createContext("none");

async function addSession(state, textRef){
	const [, setStatus] = state;
	setStatus("");
	const status = await pushSession(textRef.value);
	textRef.value = "";
	setStatus(status);
}

function setStatusClass(status){
	let status_class = "";
	switch(status){
		case "running":
			status_class += " session_run_button";
		break;
		default:
			status_class += " session_stop_button";
		break;
	}
	
	return status_class
}

function Session({username, expiration, status, id}){
	const [classes, setClasses] = useState("vertical_space_between session_delete_button");
	const [stopClasses, setStopClasses] = useState("session_stop_button");
	const [mainClass, setMainClass] = useState("container_session");
	const isRunning = status === "running";
	
	if(status == void 0){
		return <></>;
	}
	
	const addClass = (val) => {
		setClasses(classes+" "+val);
	};
		
	const deleteThisSession = async() => {
		setClasses("deleted_session");
		const deleted = await deleteSession(id);
		if(deleted)
			setMainClass("hide");
		else
			setClasses("vertical_space_between");
	}

	const stopThisSession = async() => {
		const job_status = await stopJob(id);
	}

	const runThisSession = async() => {
		const job_status = await startJob(id);
	}

	const handleThisSession = async() => {
		if(isRunning)
			stopThisSession();
		else
			runThisSession();
	}
	
	return (
		<div className={mainClass}>
			<div className="container_session_top">
		  	<p>{username ?? "?"}</p>
			</div>
			<ul>
				<li>token expiry: {expiration ?? "?"}</li>
			</ul>
			<div className={classes} onClick={() => deleteThisSession() }>
			</div>
			<div className="container_fill_animation"></div>
			<div className={"vertical_space_between session_status_button " +setStatusClass(status)} onClick={() => handleThisSession() }>
			</div>
			<div className="container_fill_animatione"></div>
	</div>
	);
}

class Sessions extends React.Component {
	state = {
		sessions: []
	}

	constructor(){
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
     	}
			this.setState(this.state);
		};

		loadSessions().then(sessions => {
			this.setState({sessions: sessions});
			const connect = () => {
				this.ws = websocket();

				this.ws.onopen= (ev) => {
					this.ws.send('{"token": "'+loadCookies().token+'"}');
				};

				this.ws.onmessage = (msg) => {
					let json;
					try{
						json = JSON.parse(msg.data);
					}catch{};
					if(json == void 0) return;

					const session = this.state.sessions.filter(x => x.id == json.id)[0];
					if(session){
						const idx = this.state.sessions.indexOf(session);
						Object.assign(this.state.sessions[idx], json);
					}else if(json.id != void 0){
						this.state.sessions.push(json);
					}
					upgrade();
				}
			}
			connect();

     	const interval = setInterval(upgrade, 1000);
		});
	}
	render() {
		return (
			<>
			{
				this.state.sessions.map(ss => {
					const options = { year: 'numeric', month: 'long', day: 'numeric', hour: "numeric" };
					const time = (new Date(ss.token_expiry*1000)).toLocaleDateString("en-US", options);

					return (<Session id={ss.id} username={ss.username} expiration={time} status={ss.status}/>);
				})
			}
			</>
		);
	}
}

function SessionModal(){
	const [context, setContext] = useContext(modalContext);
	const statusState = useState("");
	const textRef = useRef();
	
	return (
		<div className="modal" style={{display: context.modal}}>
			<div className="modal-body">
				<div className="modal-bar">
					<a>Add Session</a>
					<div className="modal-close" onClick={() => setContext({ modal: "none" })}>
						<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="40" viewBox="0 0 26 26">
							<path d="M 21.734375 19.640625 L 19.636719 21.734375 C 19.253906 22.121094 18.628906 22.121094 18.242188 21.734375 L 13 16.496094 L 7.761719 21.734375 C 7.375 22.121094 6.746094 22.121094 6.363281 21.734375 L 4.265625 19.640625 C 3.878906 19.253906 3.878906 18.628906 4.265625 18.242188 L 9.503906 13 L 4.265625 7.761719 C 3.882813 7.371094 3.882813 6.742188 4.265625 6.363281 L 6.363281 4.265625 C 6.746094 3.878906 7.375 3.878906 7.761719 4.265625 L 13 9.507813 L 18.242188 4.265625 C 18.628906 3.878906 19.257813 3.878906 19.636719 4.265625 L 21.734375 6.359375 C 22.121094 6.746094 22.121094 7.375 21.738281 7.761719 L 16.496094 13 L 21.734375 18.242188 C 22.121094 18.628906 22.121094 19.253906 21.734375 19.640625 Z"></path>
	</svg>
					</div>
				</div>
				<div className="modal-content">
					<div className="modal-form">
						<textarea ref={textRef} required id="uniqueTextArea" placeholder="put token here"></textarea>
						<a className="modal-form-status">{statusState[0]}</a>
						<button className="button" onClick={() => addSession(statusState, textRef.current)}>add session</button>
					</div>
				</div>
			</div>
		</div>
	);
}

class Account extends React.Component {
				state = {
					modal: "none"
				}
        constructor(props) {
          super(props);
        }

				setstate(value){
					return this.setState({...this.state, value});
				}

        render() {
                return (
									<>
										<modalContext.Provider value={[this.state, this.setState.bind(this)]}>
											<SessionModal/>
										</modalContext.Provider>
										<div className="flex">
											<div className="append_session" onClick={() => this.setState({ modal: "flex"}) }>
												<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z"/></svg>
											</div>
			  	    				<Sessions/>
										</div>
									</>
        );
        }
}

export default Account;
