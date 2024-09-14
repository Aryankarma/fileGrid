import inquirer from 'inquirer';
import ping from 'ping';
// import findLocalDevices from 'local-devices';
// import find from 'local-devices'
import nmap from 'node-nmap';
const IPtoPing = ['192.168.1.1', '192.168.1.2']; // Add the IPs you want to check
const pingIp = (IPtoPing) => {
    IPtoPing.forEach(async (currentIP) => {
        const res = await ping.promise.probe(currentIP);
        console.log(`${currentIP} is ${res.alive ? 'alive' : 'dead'}`);
    });
};
async function scanNetwork2() {
    const scan = new nmap.NmapScan('192.168.1.0/16');
    // Event listener for scan completion
    console.log("scanning...");
    scan.on('complete', function (data) {
        console.log('Scan results:', data);
    });
    // Event listener for scan error
    scan.on('error', function (error) {
        console.error('Error:', error);
    });
    // Start the scan
    scan.startScan();
}
// async function scanNetwork() {
//   try {
//     const devices = await findLocalDevices();
//     console.log('Connected devices:', devices);
//   } catch (error) {
//     console.error('Error scanning network:', error);
//   }
//   console.log("consoling new devices")
//   // Find all devices within 192.168.0.1 to 192.168.0.25 range
//   find({ address: '192.168.0.1-192.168.254.254' }).then(devices => {
//     console.log(devices)
//   })
// }
scanNetwork2();
// Define a set of questions to interact with the user
const questions = [
    {
        type: 'input',
        name: 'username',
        message: 'What is your name?',
    },
    {
        type: 'list',
        name: 'language',
        message: 'What programming language do you prefer?',
        choices: ['JavaScript', 'TypeScript', 'Python', 'C++'],
    },
    {
        type: 'confirm',
        name: 'confirmChoice',
        message: 'Do you want to continue?',
        default: [true, false],
    }
];
// Function to handle the interactive prompt
const askQuestions = async () => {
    try {
        const answers = await inquirer.prompt([{
                name: "whatever",
                message: "COntinue",
                type: "confirm"
            }, {
                name: "agegroup",
                message: "What is your agegroup?",
                type: "checkbox",
                choices: ["10-20", "54asd5sa", "asd2"]
            }]);
        console.log(answers);
    }
    catch (error) {
        console.error('Error:', error);
    }
};
// Call the function to run the prompt
// askQuestions();
