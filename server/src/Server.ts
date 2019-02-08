import express from "express";
import * as conf from "./config.json";
import { AccessController, AuthenticationController, UserController, WarningController} from "./controllers";
import { Database } from "./helper/Database";
import * as log from "./helper/Logger";
import * as NotificationService from "./services/NotificationService";

export const config = conf;
export const hostName = config.hostName;

export let db = new Database({
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

// Connect to the database then start server.
db.connect().then(() => {
    log.info("Connected to database.");

    app.listen(port, () => {
        log.info(`Server started listening on port ${port}.`);
    });
}).catch((err) => {
    log.error(`Failed to connect to the database. ${err}`);
});
