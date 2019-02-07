import express from "express";
import * as config from "./config.json";
import { AccessController, AuthenticationController, UserController, WarningController} from "./controllers";
import { Database } from "./helper/Database";
import * as log from "./helper/Logger";

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
export const allAuthenticatedRoutes = getAllAuthenticatedRoutes();
log.info("All authenticated routes:" + JSON.stringify(allAuthenticatedRoutes));

// Connect to the database then start server.
db.connect().then(() => {
    log.info("Connected to database.");

    app.listen(port, () => {
        log.info(`Server started listening on port ${port}.`);
    });
}).catch((err) => {
    log.error(`Failed to connect to the database. ${err}`);
});

function getAllAuthenticatedRoutes(): string[] {
    let routes: string[] = [];
    routes = routes.concat(WarningController.stack.filter((x) => x.route).map((x) => "/warning" + x.route.path));
    return routes;
}
