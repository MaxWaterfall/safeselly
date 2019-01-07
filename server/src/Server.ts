import express from "express";
import { AccessController } from "./controllers";
import { Database } from "./helper/Database";
import * as log from "./helper/Logger";

export let db = new Database({
    database: "SafeSelly",
    host: "localhost",
    password: "password",
    user: "max",
});

// Create new express application instance.
const app: express.Application = express();
const port: number = 3000;
app.use(express.json());
app.use("/access", AccessController);

db.connect().then(() => {
    log.info("Connected to database.");

    app.listen(port, () => {
        log.info(`Server started listening on port ${port}.`);
    });
}).catch((err) => {
    log.error(`Failed to connect to the database. ${err}`);
});
