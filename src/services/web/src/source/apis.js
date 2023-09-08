import services from "./services.js";

const host = services["api"];

export const API_EVENTS = "ws://"+host+":80/api/events";
export const API_SESSIONS = "http://"+host+":80/api/sessions";
export const JOBS_INFO = "http://"+host+":80/jobs/info";
export const JOBS_START = "http://"+host+":80/jobs/start";
export const JOBS_STOP = "http://"+host+":80/jobs/stop";
export const API_USERS_VALIDATE = "http://"+host+":80/api/users/validate";
