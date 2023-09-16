import React, {useState, useEffect, useRef, memo, createContext, useContext} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { loadSessions, handleEvent, websocket, get_time, calcDate, loadCookies, getJobInfo, pushSession, putSession, deleteSession, startJob, stopJob } from "./utils.js";

const modalContext = createContext("none");

async function addSession(state, textRef, xaccessRef, nameRef){
	const [, setStatus] = state;
	setStatus("");
	const status = await pushSession({token: textRef.value, xaccess: xaccessRef.value, username: nameRef.value});
	textRef.value = "";
	xaccessRef.value = "";
	nameRef.value = "";
	setStatus(status);
}

async function updateSession(state, id, tokenRef, xaccessRef, nameRef) {
	const [, setStatus] = state;
	const name = nameRef.value;
	const token = tokenRef.value;
	const xaccess = xaccessRef.value;
	const status = await putSession(id, {username: name, token: token, xaccess: xaccess});
	setStatus(status);
}

function makeSessionItems(session){
	const session_running = session.job_status == 1;
	let [days, hours, mins, secs] = calcDate(get_time(), +session.token_expiry);
	const token_expiry = (session.token_expiry - get_time()) > 0 ? `${hours}:${mins}:${secs}` : `00:00:00`;
	[days, hours, mins, secs] = calcDate(+session.begin_time, get_time());
  const elapsed_time = session_running ? `${hours}:${mins}:${secs}` : "00:00:00";
	[days, hours, mins, secs] = calcDate(get_time(), session.current.readyIn);
	const activity_time_left =	(session.current.readyIn - get_time()) > 0 && session_running ? `${mins}:${secs}` : "00:00";
	const activities_done = session.activities_done;

	return {
		"Token Expiry Timelapse": token_expiry,
		"Elapsed Time": elapsed_time,
		"Activity Timelapse": activity_time_left,
		"Activities Done": activities_done,
		"Current Level": session.current.level_name,
		"Current Unit": session.current.unit_name,
		"Current Lesson": session.current.lesson_name,
		"Current Step": session.current.step_name,
	}
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

function EditSection({session}){
	const [context, setContext] = useContext(modalContext);
	const statusState = useState("");
	const tokenRef = useRef();
	const xaccessRef = useRef();
	const nameRef = useRef();

	return (
		<div className="modal-content">
			<div className="modal-form">
				<textarea ref={nameRef} required placeholder="username" className="modal-input">{session.username}</textarea>
				<textarea ref={tokenRef} required id="uniqueTextArea" className="modal-input" placeholder="token">{session.token}</textarea>
				<textarea ref={xaccessRef} required placeholder="x-access" className="modal-input">{session.xaccess}</textarea>
				<a className="modal-form-status">{statusState[0]}</a>
				<button className="button" onClick={() => updateSession(statusState, session.id, tokenRef.current, xaccessRef.current, nameRef.current)}>update</button>
			</div>
		</div>
	);
}

function Session({pushEvent, session}){
	const [classes, setClasses] = useState("vertical_space_between session_delete_button");
	const [stopClasses, setStopClasses] = useState("session_stop_button");
	const [editSessionClass, setEditSessionClass] = useState("container_session_edit");
	const [mainClass, setMainClass] = useState("container_session");
	const logs = session.logs.map(x => `[${new Date(x.time).toLocaleString()}]: ${x.message}`).join("\n");
	const {username, status, id} = session;
	const isRunning = status === "running";
	const editSectionClosed = editSessionClass == "container_session_edit";
	
	if(status == void 0){
		return <></>;
	}

	const addClass = (val) => {
		setClasses(classes+" "+val);
	};
		
	const deleteThisSession = async() => {
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

	const makeItem = (title, description) => {
		return (<div>
					<h4>{title}</h4>
					<a>{description}</a>
			</div>);
	};
	
	const objToItem = (obj) => {
		const keys = Object.keys(obj);
		return keys.map(key => makeItem(key, obj[key]))
	};

	const sessionInfo = () => {
		const obj = makeSessionItems(session);
		return objToItem(obj);
	};

	const openCloseEditSection = () => {
		if(editSectionClosed)
			setEditSessionClass("container_session_edit edit_open_animation");
		else
			setEditSessionClass("container_session_edit");
	};

	return (
		<div className={mainClass}>
			<div className="container_session_top">
		  	<p>{username ?? "?"}</p>
			</div>
			<div className="container_session_info">
				{ sessionInfo()	}
			</div>
			<div className="container_session_logs">
				<textarea disabled value={logs}></textarea>
			</div>
			<div className={editSessionClass}>
				<EditSection session={session}/>
			</div>
			<div className="container_session_buttons">
				<div className={classes} onClick={() => deleteThisSession() }></div>
				<div className="vertical_space_between session_edit_button" onClick={() => openCloseEditSection()}>{editSectionClosed ? "Edit" : "Close"}</div>
				<div className={"vertical_space_between session_status_button " +setStatusClass(status)} onClick={() => handleThisSession() }></div>
			</div>
		</div>
	);
}

class Sessions extends React.Component {
	state = {
		sessions: []
	}

	constructor({pushEvent}){
		super();
		this.pushEvent = pushEvent;
		const upgrade = async() => {
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

		const onMessage = async(json) => {
			const session = this.state.sessions.filter(x => x.id == json.id)[0];
			if(session){
				const idx = this.state.sessions.indexOf(session);
				Object.assign(this.state.sessions[idx], json);
			}else if(json.id != void 0){
				this.state.sessions.push(json);
			}
		}

		loadSessions().then(sessions => {
			this.setState({sessions: sessions});
			pushEvent(onMessage);

     	const interval = setInterval(upgrade, 500);
		});
	}
	render() {
		return (
			<>
			{
				this.state.sessions.map(ss => {
					return (<Session pushEvent={this.pushEvent} session={ss}/>);
				})
			}
			</>
		);
	}
}

function SessionModal(){
	const [context, setContext] = useContext(modalContext);
	const statusState = useState("");
	const tokenRef = useRef();
	const xaccessRef = useRef();
	const nameRef = useRef();
	
	return (
		<div className="modal" style={{display: context.modal}}>
			<div className="modal-body">
				<div className="modal-bar">
					<div className="modal-close" onClick={() => setContext({ modal: "none" })}>
						<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="40" viewBox="0 0 26 26">
							<path d="M 21.734375 19.640625 L 19.636719 21.734375 C 19.253906 22.121094 18.628906 22.121094 18.242188 21.734375 L 13 16.496094 L 7.761719 21.734375 C 7.375 22.121094 6.746094 22.121094 6.363281 21.734375 L 4.265625 19.640625 C 3.878906 19.253906 3.878906 18.628906 4.265625 18.242188 L 9.503906 13 L 4.265625 7.761719 C 3.882813 7.371094 3.882813 6.742188 4.265625 6.363281 L 6.363281 4.265625 C 6.746094 3.878906 7.375 3.878906 7.761719 4.265625 L 13 9.507813 L 18.242188 4.265625 C 18.628906 3.878906 19.257813 3.878906 19.636719 4.265625 L 21.734375 6.359375 C 22.121094 6.746094 22.121094 7.375 21.738281 7.761719 L 16.496094 13 L 21.734375 18.242188 C 22.121094 18.628906 22.121094 19.253906 21.734375 19.640625 Z"></path>
	</svg>
					</div>
				</div>
				<div className="modal-content">
					<div className="modal-form">
						<textarea ref={nameRef} required placeholder="username" className="modal-input"></textarea>
						<textarea ref={tokenRef} required id="uniqueTextArea" className="modal-input" placeholder="token"></textarea>
						<textarea ref={xaccessRef} required placeholder="x-access" className="modal-input"></textarea>
						<a className="modal-form-status">{statusState[0]}</a>
						<button className="button" onClick={() => addSession(statusState, tokenRef.current, xaccessRef.current, nameRef.current)}>add session</button>
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
					this.pushEvent = props.pushEvent;
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
										<div className="flex_column">
											<div className="append_session" onClick={() => this.setState({ modal: "flex"}) }>
												<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z"/></svg>
												<div>
													<a>add session</a>
												</div>
											</div>
											<div className="flex">
												<Sessions pushEvent={this.pushEvent}/>
											</div>
										</div>
									</>
        );
        }
}

export default Account;
