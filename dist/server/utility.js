import { SESSIONS, USERS } from "./constants";
export function isSessionAvailable(session_id) {
    if (session_id)
        for (let sid of SESSIONS.values()) {
            if (sid === session_id) {
                return true;
            }
        }
    return false;
}
export function createUser(username, password) {
    if (USERS.has(username)) {
        return false;
    }
    USERS.set(username, { username, password });
    return true;
}
export function authenticateUser(username, password) {
    const user = USERS.get(username);
    return user ? user.password === password : false; // Check password
}
