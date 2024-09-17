import express from 'express';
import { createServer, get } from 'http';
import { Server, Socket } from "socket.io";
import cuid2, { createId } from "@paralleldrive/cuid2";
import { SESSIONS, API_KEYS, USERS, FILES } from "./constants";
import { isSessionAvailable, createUser, authenticateUser, apiKeyMiddleware, getUsernameFromSessionID, addFileInfoToMap, isFileAvailable, getFileMetadata } from './utility';
import multer from 'multer';
import fs, { readFileSync } from 'fs';
import { loadDataFromFile } from './utility';

loadDataFromFile();

const app = express();
const server = createServer(app);
const io = new Server(server);
app.use(express.json());

app.use(apiKeyMiddleware)

const sessionAvailableMiddleware = (req, res, next) => {
  const sessionId = req.headers["x-session-id"] as string;
  if (SESSIONS.has(sessionId)) {
    next();
  } else {
    res.status(401).send("Session not available");
  }
};


app.post("/auth/signup", (req, res) => {
  const { username, password } = req.body;
  if (createUser(username, password)) {
    res.status(201).json({ message: "User created successfully" });
  } else {
    res.status(400).send("User already exists");
  }
});

app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (authenticateUser(username, password)) {
    const session_id = createId()
    SESSIONS.set(session_id, username);
    res.status(200).json({ message: "Login successful", session_id });
  } else {
    res.status(401).send("Invalid username or password");
  }
});

app.use(sessionAvailableMiddleware);

app.get("/files", (req, res) => {
  console.log(JSON.stringify(FILES))
  const sessionId = req.headers["x-session-id"] as string;
  const username = getUsernameFromSessionID(sessionId);
  res.json(FILES.get(username!));
});

const uploadDir = 'uploads/default';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });


app.post("/files", upload.single('file'), (req, res) => {
  const { filename } = req.params;
  const file = req.file;

  const sessionId = req.headers["x-session-id"] as string;
  const username = getUsernameFromSessionID(sessionId)!;
  
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }
  const fileMetaData = {
    id: createId(),
    filename: file.filename,
    path: `/files/${file.filename}`,
    size: file.size,
    encoding: file.encoding,
    mimetype: file.mimetype,
  };
  addFileInfoToMap(username, fileMetaData);


  res.status(200).json({ message: "File uploaded successfully", fileMetaData });
});

app.get("/files/:filename",async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string;
  const username = getUsernameFromSessionID(sessionId)!;
  const { filename } = req.params;

 
  const filePath = `/Users/abhishek/Developer/clash2.0/fileGrid/uploads/${username}/${filename}`;
  console.log(filePath);

  try {
    const fileMetaData = getFileMetadata(filename, username);

    // Read the file synchronously as binary (Buffer)
    const data = fs.readFileSync(filePath);

    const mimeType = fileMetaData?.mimetype || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.write(data);
    return res.end(); // Ensure no further code runs after sending the response
  } catch (err) {
    console.error('Error reading file:', err);

    // Handle different error cases
    if ((err as any).code === 'ENOENT') {
      return res.status(404).send("File not found.");
    } else if ((err as any).code === 'EACCES') {
      return res.status(403).send("Permission denied.");
    } else {
      return res.status(500).send("Server error.");
    }
  }

})

io.use((socket, next) => {
  const api_key = socket.handshake.headers["x-api-key"] as string
  if (!API_KEYS.includes(api_key)) {
    next(new Error("API Key not found!"));
  }
  const session_id = socket.handshake.headers["x-session-id"] as string;
  if (isSessionAvailable(session_id)) {
    next(new Error("Authentication not found!"))
  }
})


io.on("disconnect", (socket: Socket) => {
  const socket_id = socket.id;
  if (SESSIONS.has(socket_id)) {
    SESSIONS.delete(socket_id)
  }
});


(async () => {
  server.listen(2121, () => console.log("Server running on port 2121"));
})()

import { saveDataToFile } from './utility';

// Save data on process exit
process.on('exit', saveDataToFile);
process.on('SIGINT', () => {
    saveDataToFile();
    process.exit();
});
process.on('SIGTERM', () => {
    saveDataToFile();
    process.exit();
});