import express from "express";
import { buildDatabase, createFakeWarnings } from "../test/BuildDatabase";
import * as conf from "./config.json";
import {
    AccessController,
    AuthenticationController,
    UserController,
    WarningController,
 } from "./controllers";
import { Database } from "./helper/Database";
import * as log from "./helper/Logger";

export const config = conf;

export let db = new Database({
    connectionLimit: config.connectionLimit,
    database: config.databaseName,
    host: config.databaseHost,
    password: config.databasePassword,
    user: config.databaseUsername,
    multipleStatements: true,
});

if (config.buildDatabase && config.createFakeWarnings) {
    buildDatabase(config.createFakeWarnings);
} else if (config.createFakeWarnings) {
    createFakeWarnings();
}

// Create new express application instance.
const app: express.Application = express();
const port: number = config.port;

// Parse the body.
app.use(express.json());

// Below route is used to register, does not require authentication.
app.use(config.prefix + "access", AccessController);

// All routes below are now protected with authentication.
app.use(config.prefix + "user", AuthenticationController, UserController);
app.use(config.prefix + "warning", AuthenticationController, WarningController);

// Start server.
app.listen(port, () => {
    log.info(`Server started listening on port ${port}.`);
});
