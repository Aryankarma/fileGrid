import { NextFunction, Request, Response } from "express";
import { API_KEYS, FILES, SESSIONS, USERS } from "./constants"
import { createId } from "@paralleldrive/cuid2";
import { File } from "./types";
import fs from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(__dirname, 'data.json');

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
    const api_key = req.headers["x-api-key"] as string;
    if (!API_KEYS.includes(api_key)) {
        return res.status(403).send("API Key not found!"); // {{ edit_1 }}
    }
    next();
}

export function addFileInfoToMap(username: string, file: File) {
    const existingFiles = FILES.get(username) || [];
    existingFiles.push(file);
    FILES.set(username, existingFiles);
}

export function isSessionAvailable(session_id: string) {
    if (session_id)
        for (let sid of SESSIONS.values()) {
            if (sid === session_id) {
                return true;
            }
        }
    return false
}

export function getUsernameFromSessionID(session_id: string): string | null {
    if (SESSIONS.has(session_id)) {
        return SESSIONS.get(session_id) || null;
    }
    return null;
}

export function createUser(username: string, password: string): boolean {
    if (USERS.has(username)) {
        return false;
    }
    USERS.set(username, { username, password });
    return true;
}

export function authenticateUser(username: string, password: string): boolean {
    const user = USERS.get(username);
    return user ? user.password === password : false; // Check password
}

export function saveDataToFile() {
    const data = {
        files: Array.from(FILES.entries()),
        sessions: Array.from(SESSIONS.entries()),
        users: Array.from(USERS.entries()),
    };
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
}

export function loadDataFromFile() {
    if (fs.existsSync(DATA_FILE_PATH)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
        data.files.forEach(([username, files]) => FILES.set(username, files));
        data.sessions.forEach(([sessionId, username]) => SESSIONS.set(sessionId, username));
        data.users.forEach(([username, userData]) => USERS.set(username, userData));
    }
}

export function isFileAvailable(filename: string, username: string): boolean {
    const userFiles = FILES.get(username);
    return userFiles ? userFiles.some(file => file.filename === filename) : false;
}


export function getFileMetadata(filename: string, username: string){
    if (isFileAvailable(filename, username)) {
        const userFiles = FILES.get(username)!;
        const file = userFiles.find(file => file.filename === filename);
        return file
    }
    return null; // Return null if file not found
}