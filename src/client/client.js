#!/usr/bin/env node

import dotenv from "dotenv";
import inquirer from "inquirer";
import ping from "ping";
import ip from "ip";
import net from "net";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import path from "path";

dotenv.config();

// main variables
const portNumber = process.env.PORT_NUMBER || 2121;
const startIP = process.env.START_IP || "192.168.179.140"; // Default values as fallback
const endIP = process.env.END_IP || "192.168.179.150";
const apiKey = process.env.API_KEY;
let sessionID = "";
let selectedFileToDownload = "";
const connectableIP = [];

function generateIPRange(startIP, endIP) {
  const ipArray = [];
  let currentIP = ip.toLong(startIP);
  const endIPLong = ip.toLong(endIP);

  while (currentIP <= endIPLong) {
    ipArray.push(ip.fromLong(currentIP));
    currentIP++;
  }

  return ipArray;
}

function scanPort(ips, port) {
  return Promise.all(
    ips.map((singleIP) => {
      return new Promise((resolve) => {
        const socket = new net.Socket();

        // Set timeout for the connection attempt
        socket.setTimeout(2000);

        // If the connection is successful
        socket.connect(port, singleIP, () => {
          console.log(`Connected to ${singleIP} on port ${port}`);
          connectableIP.push([singleIP, port]);
          socket.destroy();
          resolve({ ip: singleIP, port, status: "open" });
        });

        // If there is an error (port is closed or filtered)
        socket.on("error", () => {
          // console.log(`Failed to connect to ${singleIP} on port ${port}`);
          socket.destroy();
          resolve({ ip: singleIP, port, status: "closed" });
        });

        // If the connection times out
        socket.on("timeout", () => {
          // console.log(`Connection to ${singleIP} on port ${port} timed out`);
          socket.destroy();
          resolve({ ip: singleIP, port, status: "filtered" });
        });
      });
    })
  );
}

async function getAvailableDevices() {
  const ipRange = generateIPRange(startIP, endIP);

  const availableDevices = [];

  console.log("Scanning devices...");

  // Function to ping a single IP
  async function pingHost(host) {
    try {
      const res = await ping.promise.probe(host);
      if (res.alive) {
        availableDevices.push(host);
        // console.log(`${host}: Online`);
      } else {
        // console.log(`${host}: Offline`);
      }
    } catch (error) {
      console.error(`Error pinging ${host}:`, error);
    }
  }

  // Use a limit on concurrent pings to manage load
  const limit = 50; // Adjust based on your needs
  let index = 0;

  async function processNextBatch() {
    const batch = ipRange.slice(index, index + limit);
    index += limit;
    await Promise.all(batch.map(pingHost));
    if (index < ipRange.length) {
      await processNextBatch();
    }
  }

  await processNextBatch();

  return availableDevices;
}

// Function to handle the interactive prompt
const LoginDetails = async () => {
  try {
    const LoginData = await inquirer.prompt([
      {
        name: "username",
        message: "Enter username",
        type: "input",
      },
      {
        name: "password",
        message: "Enter password",
        type: "password",
      },
    ]);
    return LoginData;
  } catch (error) {
    console.error("Error:", error);
  }
};

const fileTransferOptions = async () => {
  try {
    const fileTransferAnswers = await inquirer.prompt([
      {
        type: "list",
        name: "FileOperations",
        message: "What would you like to do: ",
        choices: ["Send File", "List File", "Download File"],
      },
    ]);
    return fileTransferAnswers;
  } catch (error) {
    console.error("Error:", error);
  }
};

const fileToDownloadOptions = async (options) => {
  try {
    const selectedFileToDownload = await inquirer.prompt([
      {
        type: "list",
        name: "fileToDownload",
        message: "Select a file to download: ",
        choices: options,
      },
    ]);
    return selectedFileToDownload;
  } catch (error) {
    console.error("Error:", error);
  }
};

// get filepath to upload file
const getUploadFilePath = async (options) => {
  try {
    const uploadFilePath = await inquirer.prompt([
      {
        type: "input",
        name: "uploadFilePath",
        message: "Input your file path: ",
      },
    ]);
    return uploadFilePath;
  } catch (error) {
    console.error("Error:", error);
  }
};

// connect to a device
async function connection(url, data) {
  try {
    const response = await axios.post(url, data, {
      headers: {
        "x-api-key": apiKey,
      },
    });
    // console.log('Data successfully posted:', response.data);
    return response.data;
  } catch (error) {
    // Handling error
    console.error(
      "Error posting data:",
      error.response ? error.response.data : error.message
    );
  }
}

// check for available files on the server
async function availableFiles(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        "x-api-key": apiKey,
        "x-session-id": sessionID,
      },
    });
    // console.log('Data successfully recieved:', response.data);
    return response.data;
  } catch (error) {
    // Handling error
    console.error(
      "Error posting data:",
      error.response ? error.response.data : error.message
    );
  }
}

// upload files to server
const uploadFile = async (url, filePath) => {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  try {
    const response = await axios.post(url, form, {
      headers: {
        "x-api-key": apiKey,
        "x-session-id": sessionID,
      },
    });
    console.log("File uploaded successfully!");
  } catch (error) {
    console.error(
      "Error uploading file:",
      error.response ? error.response.data : error.message
    );
  }
};

// download files to server
const downloadFile = async (url, fileName) => {
  try {
    const folderPath = path.resolve("recieveData");
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    const response = await axios.get(url, {
      headers: {
        "x-api-key": apiKey,
        "x-session-id": sessionID,
      },
      responseType: "stream", // Use 'stream' to handle large files
    });

    // Define the path to save the file
    const filePath = path.join(folderPath, fileName);

    // Pipe the file stream to write it locally
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log(`File successfully saved to ${filePath}`);
        resolve();
      });
      writer.on("error", (error) => {
        console.error("Error writing file:", error);
        reject(error);
      });
    });

    // console.log(url)
    // return response
  } catch (error) {
    console.error(
      "Error Downloading file: ",
      error.response ? error.response.data : error.message
    );
  }
};

// main function
(async () => {
  // scan for available devices on the network
  try {
    const availableDevices = await getAvailableDevices();
    const results = await scanPort(availableDevices, portNumber);
    results.forEach((result) => {
      if (result.status == "open") {
        console.log(
          `IP: ${result.ip}, Port: ${result.port}, Status: ${result.status}`
        );
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }

  // authentication
  const answers = await LoginDetails();

  const sessionData = await connection(
    `http://${connectableIP[0][0]}:${connectableIP[0][1]}/auth/login`,
    answers
  );
  sessionID = sessionData.session_id;

  const fileTransferAnswers = await fileTransferOptions();

  if (
    fileTransferAnswers.FileOperations === "List File" ||
    fileTransferAnswers.FileOperations === "Download File"
  ) {
    const availableFilesData = await availableFiles(
      `http://${connectableIP[0][0]}:${connectableIP[0][1]}/files`,
      answers
    );
    // console.log(fileTransferAnswers)
    if (fileTransferAnswers.FileOperations === "List File") {
      console.table(availableFilesData);
    } else {
      const fileNameList = [];
      availableFilesData.map((file) => {
        fileNameList.push(file.filename);
      });
      selectedFileToDownload = await fileToDownloadOptions(fileNameList);
      await downloadFile(
        `http://${connectableIP[0][0]}:${connectableIP[0][1]}/files/${selectedFileToDownload.fileToDownload}`,
        selectedFileToDownload.fileToDownload
      );
    }
  } else {
    const { uploadFilePath } = await getUploadFilePath();
    console.log(uploadFilePath);
    if (fs.existsSync(uploadFilePath)) {
      console.log(`Uploading file (${uploadFilePath})`);
      await uploadFile(
        `http://${connectableIP[0][0]}:${connectableIP[0][1]}/files/`,
        uploadFilePath
      );
    } else {
      console.error("file path not found");
    }
  }
})();
