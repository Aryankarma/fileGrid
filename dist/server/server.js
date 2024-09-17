import express from 'express';
import { createServer } from 'http';
import { Server } from "socket.io";
import { SESSIONS, API_KEYS } from "./constants";
import { isSessionAvailable, createUser, authenticateUser } from './utility';
const app = express();
const server = createServer(app);
const io = new Server(server);
app.use(express.json());
app.use("/auth/signup", (req, res) => {
    const { username, password } = req.body;
    if (createUser(username, password)) {
        res.status(201).send("User created successfully");
    }
    else {
        res.status(400).send("User already exists");
    }
});
app.post("/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (authenticateUser(username, password)) {
        res.status(200).send("Login successful");
    }
    else {
        res.status(401).send("Invalid username or password");
    }
});
io.use((socket, next) => {
    const api_key = socket.handshake.headers["x-api-key"];
    if (!API_KEYS.includes(api_key)) {
        next(new Error("API Key not found!"));
    }
    const session_id = socket.handshake.headers["x-session-id"];
    if (isSessionAvailable(session_id)) {
        next(new Error("Authentication not found!"));
    }
});
io.on("disconnect", (socket) => {
    const socket_id = socket.id;
    if (SESSIONS.has(socket_id)) {
        SESSIONS.delete(socket_id);
    }
});
(async () => {
    server.listen(2121, () => console.log("Server running on port 3000"));
})();
