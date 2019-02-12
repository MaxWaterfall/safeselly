import * as fs from "fs";
import { TransformableInfo } from "logform";
import {createLogger, format, transports} from "winston";
import DailyRotateFile = require("winston-daily-rotate-file");

const env = process.env.NODE_ENV || "development";
const logDir = "log";
const longestLevelLength = 7;

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Longest level is 7 chars long, this ensures the messages are aligned.
const levelFormat = format((inf) => {
    inf.level = inf.level + " ".repeat(longestLevelLength - inf.levelLength);
    return inf;
});

const logger = createLogger({
    transports: [
        new DailyRotateFile({
            filename: `${logDir}/%DATE%-results.log`,
            datePattern: "DD-MM-YY",
            level: env === "development" ? "debug" : "info",
            format: format.combine(
                format.timestamp({
                    format: "hh:mm:ss",
                }),
                levelFormat(),
                format.printf((inf: TransformableInfo) => {
                    return `${inf.level} ${inf.timestamp}: ${inf.message}`;
                }),
            ),
        }),
        new transports.Console({
            level: env === "development" ? "info" : "error",
            format: format.combine(
                format.colorize(),
                format.timestamp({
                    format: "DD-MM-YY hh:mm:ss",
                }),
                levelFormat(),
                format.printf((inf: TransformableInfo) => {
                    return `${inf.level} ${inf.timestamp}: ${inf.message}`;
                }),
            ),
        }),
    ],
});

/**
 * The set of functions below look pointless but they are required to ensure all messages are aligned.
 * Doing info.level.length in the printf or levelFormat functions fails.
 * Levels: error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5
 */
export function error(logMessage: string) {
    logger.log({
        level: "error",
        levelLength: 5,
        message: logMessage,
    });
}

export function warn(logMessage: string) {
    logger.log({
        level: "warn",
        levelLength: 4,
        message: logMessage,
    });
}

export function info(logMessage: string) {
    logger.log({
        level: "info",
        levelLength: 4,
        message: logMessage,
    });
}

export function verbose(logMessage: string) {
    logger.log({
        level: "verbose",
        levelLength: 7,
        message: logMessage,
    });
}

export function debug(logMessage: string) {
    logger.log({
        level: "debug",
        levelLength: 5,
        message: logMessage,
    });
}

export function silly(logMessage: string) {
    logger.log({
        level: "silly",
        levelLength: 5,
        message: logMessage,
    });
}

export function databaseError(err: string) {
    error("Database error: " + err);
}

export function encryptionError(err: string) {
    error("Encryption error: " + err);
}

export function tokenGenerationError(err: string) {
    error("Token generation error: " + err);
}
