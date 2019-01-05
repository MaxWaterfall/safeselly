import express from "express";
import { AccessController, TestController } from "./controllers";
import { Database } from "./helper/Database";

export let db = new Database({
    host: "localhost",
    user: "max",
    password: "password",
    database: "SafeSelly",
});

// Create new express application instance.
const app: express.Application = express();
const port: number = 3000;
app.use(express.json());
app.use("/access", AccessController);

db.connect().then(() => {
    //TODO: Log.
    app.listen(port, () => {
        // Success.
        //TODO: Log.
    });
}).catch((err) => {
    //TODO: Log.
    console.log("Connection to DB failed.");
});
