const fs = require('fs');
const moment = require('moment');
const Table = require('cli-table3');

// Function to count how many times each endpoint is called
function countEndpointCalls(logData:any) {
  const endpointCounts:any = {};
  logData.forEach((logEntry:any) => {
    const endpoint = logEntry.split(' ')[1];
    endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
  });
  return endpointCounts;
}

// Function to count API calls per minute
function countApiCallsPerMinute(logData:any) {
  const apiCallsPerMinute:any = {};
  logData.forEach((logEntry:any) => {
    const timestamp = logEntry.split(' ')[0].slice(1, -1); // Remove square brackets from timestamp
    const minute = moment(timestamp).format('YYYY-MM-DD HH:mm');
    apiCallsPerMinute[minute] = (apiCallsPerMinute[minute] || 0) + 1;
  });
  return apiCallsPerMinute;
}

// Function to count total API calls for each HTTP status code
function countApiCallsByStatusCode(logData:any) {
  const apiCallsByStatusCode:any = {};
  logData.forEach((logEntry:any) => {
    const statusCode = logEntry.split(' ')[2];
    apiCallsByStatusCode[statusCode] = (apiCallsByStatusCode[statusCode] || 0) + 1;
  });
  return apiCallsByStatusCode;
}

// Read the log file and parse its content
function readLogFile(filePath:any) {
  return new Promise((resolve, reject) => {
    const logData:any = [];
    fs.createReadStream(filePath)
      .on('data', (data:any) => {
        const lines = data.toString().split('\n');
        lines.forEach((line:any) => {
          if (line.trim() !== '') {
            logData.push(line.trim());
          }
        });
      })
      .on('end', () => resolve(logData))
      .on('error', (error:any) => reject(error));
  });
}

// Function to analyze a log file and display the results
async function analyzeLogFile(logFilePath:any) {
  try {
    const logData = await readLogFile(logFilePath);

    // Task 1: Count how many times each endpoint is called
    const endpointCounts = countEndpointCalls(logData);

    // Task 2: Count API calls per minute
    const apiCallsPerMinute = countApiCallsPerMinute(logData);

    // Task 3: Count total API calls for each HTTP status code
    const apiCallsByStatusCode = countApiCallsByStatusCode(logData);

    // Display data in formatted tables
    const endpointTable = new Table({
      head: ['Endpoint', 'Count'],
      colWidths: [25, 10],
    });
    Object.entries(endpointCounts).forEach(([endpoint, count]) => {
      endpointTable.push([endpoint, count]);
    });

    const minuteTable = new Table({
      head: ['Minute', 'API Calls'],
      colWidths: [20, 12],
    });
    Object.entries(apiCallsPerMinute).forEach(([minute, count]) => {
      minuteTable.push([minute, count]);
    });

    const statusCodeTable = new Table({
      head: ['Status Code', 'Count'],
      colWidths: [25, 10],
    });
    Object.entries(apiCallsByStatusCode).forEach(([statusCode, count]) => {
      statusCodeTable.push([statusCode, count]);
    });

    console.log(`\nEndpoint Counts for ${logFilePath}:\n`);
    console.log(endpointTable.toString());

    console.log(`\nAPI Calls Per Minute for ${logFilePath}:\n`);
    console.log(minuteTable.toString());

    console.log(`\nAPI Calls By Status Code for ${logFilePath}:\n`);
    console.log(statusCodeTable.toString());
  } catch (error:any) {
    console.error(`Error processing ${logFilePath}:`, error.message);
  }
}

// Main function to run the CLI application for all log files
async function main() {
  const logFiles = ['api-dev-out.log', 'api-prod-out.log', 'prod-api-prod-out.log'];

  for (const logFile of logFiles) {
    await analyzeLogFile(logFile);
  }
}

main();
