const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info', // Set the minimum logging level
  format: format.combine(
    format.timestamp(), // Add a timestamp to each log
    format.json() // Format the logs as JSON
  ),
  transports: [
    new transports.Console(), // Log to the console
  ],
});

module.exports = logger;