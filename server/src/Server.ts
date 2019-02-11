import express from "express";
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
export const hostName = config.hostName;

export let db = new Database({
    connectionLimit: config.connectionLimit,
    database: config.databaseName,
    host: config.databaseHost,
    password: config.databasePassword,
    user: config.databaseUsername,
});

// Create new express application instance.
const app: express.Application = express();
const port: number = config.port;

// Parse the body.
app.use(express.json());

// Below route is used to register, does not require authentication.
app.use("/access", AccessController);

// All routes below are now protected with authentication.
app.use("/user", AuthenticationController, UserController);
app.use("/warning", AuthenticationController, WarningController);

// Start server.
app.listen(port, () => {
    log.info(`Server started listening on port ${port}.`);
});
