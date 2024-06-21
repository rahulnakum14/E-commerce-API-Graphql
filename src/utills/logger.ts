/* Logging Using Winston */

import winston, { format as Format, transports as Transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = Format.combine(
  Format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
//   Format.colorize({ all: true }), Enable colorization for all logs
  Format.errors({ stack: true }),
  Format.splat(),
  Format.json()
);

const consoleTransport = new Transports.Console({
  format: Format.combine(
    Format.colorize(),
    Format.simple()
  )
});

const fileTransport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

const transports = [
  consoleTransport,
  fileTransport,
  new Transports.File({ filename: 'logs/error.log', level: 'error' })
];

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports
});

export default Logger;

/** Logging Using Pino */
// Defaults 
// import pino from "pino";
// import path from "path";
// import fs from "fs";

// // Define the path for the log file
// const logFilePath = path.join(__dirname, "../../logs/app.log");

// // Createing a  stream to the log file
// const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

// // Create a Pino logger instance with the file destination
// const logger = pino({ level: "info" }, logStream);

// export default logger;
