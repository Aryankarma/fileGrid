# FTP Client-Server Application

This project implements a simple FTP (File Transfer Protocol) system that allows users to upload and download files between a client and server on the same network. Built using **Node.js** and **TypeScript**, this project demonstrates how a server can handle file transfers, and a terminal-based client interface can send or receive data efficiently.

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Video Walkthrough](#Video-Walkthrough)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Contributors](#contributors)
- [License](#license)

## Features
- **File Upload:** The client can upload files to the server.
- **File Download:** The client can download files from the server.
- **Terminal-Based Interface:** The entire interaction happens via the command line, making it simple and lightweight.
- **Local Network Support:** Both client and server communicate over the same network.

## Technology Stack
- **Node.js**: Server-side JavaScript runtime
- **TypeScript**: Typed superset of JavaScript that compiles to plain JavaScript
- **Socket.io**: Enables real-time, bidirectional communication
- **Express**: Web framework for Node.js, used for handling server routes
- **File System (fs)**: Core Node.js module for handling file operations

## Video Walkthrough
[Screencast from 2024-09-14 16-10-49.webm](https://github.com/user-attachments/assets/c45fb9ec-e148-4df9-be21-df45c62dc484)

## Project Structure
```
filegrid/
├── dist/
│   ├── client/
│   ├── server/
│   └── server.js
├── recieveData/
├── src/
│   ├── client/
│   │   └── client.js
│   └── server/
│       └── server.ts
├── tempdata/
├── .gitignore
├── package-lock.json
├── package.json
└── tsconfig.json
```

## Prerequisites
Before setting up the project, make sure you have the following installed:
- **Node.js** (version 14 or above)
- **npm** (Node Package Manager)

To check if Node.js and npm are installed, run the following commands in your terminal:
```bash
node -v
npm -v
```

## Setup Instructions
1. Clone the Repository
   Start by cloning this repository to your local machine using Git:

   ```bash
   git clone https://github.com/yourusername/ftp-client-server.git
   cd filegrid
   ```

2. Install Dependencies
   Install the required dependencies:

   ```bash
   npm install
   ```

3. Server Setup
   The server is responsible for handling file uploads and downloads. To start the server:

   ```bash
   node src/server/server.ts
   ```

   By default, the server runs on port 3000. You can change the port by editing the server.ts file.

4. Client Setup
   The client is used to upload or download files. Start the client in another terminal:

   ```bash
   node src/client/client.js
   ```

   Make sure the client points to the correct server address. You can adjust the server IP and port by modifying the client-side code in client.js if necessary.

Note: The `dist` folder contains the compiled JavaScript files. If you make changes to the TypeScript files in the `src` folder, make sure to compile them before running the application.

## Usage
### Upload a File
1. Run the client script as shown above.
2. When prompted, choose the Upload option.
3. Enter the file path of the file you want to upload.
4. The client sends the file to the server, and you will see a confirmation message on both the client and server sides.

### Download a File
1. Run the client script and select the Download option.
2. Enter the file name you want to download.
3. The file will be transferred from the server to your client machine.

## Contributors
- [Aryan Karma](https://github.com/aryankarma) – Project lead and developer
- [Abhishek Mourya](https://github.com/abhishekmourya) – Collaborator and developer

## License
This project is licensed under the MIT License - see the LICENSE file for details.
