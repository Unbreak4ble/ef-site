import services from "./services.js";

const host = services["api"];

export const API_EVENTS = "ws://"+host+":80/api/events";
export const API_SESSIONS = "http://"+host+":80/api/sessions";
export const JOBS_INFO = "http://"+host+":80/jobs/info";
