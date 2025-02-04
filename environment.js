const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to get network interfaces
function getNetworkInterfaces() {
    const interfaces = os.networkInterfaces();
    let networkDetails = {};
    
    for (const [name, details] of Object.entries(interfaces)) {
        networkDetails[name] = details.map(detail => ({
            address: detail.address,
            family: detail.family,
            mac: detail.mac,
            internal: detail.internal
        }));
    }
    return networkDetails;
}

// Collect system environment details
const envDetails = {
    homeDirectory: os.homedir(),
    hostname: os.hostname(),
    networkInterfaces: getNetworkInterfaces(),
    environmentVariables: process.env
};

// Define the path for saving the JSON file
const logsDir = path.join(__dirname, 'logs');
const filePath = path.join(logsDir, 'env-details.json');

// Ensure the logs directory exists
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Write details to the JSON file with error handling
try {
    fs.writeFileSync(filePath, JSON.stringify(envDetails, null, 2), 'utf-8');
    console.log(`Environment details saved to ${filePath}`);
} catch (error) {
    console.error('Error writing to file:', error.message);
}
