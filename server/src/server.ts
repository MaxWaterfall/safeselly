import express from 'express';
import { AccessController } from './controllers';
import mysql, { MysqlError } from 'mysql';

// Set up DB connection.
let con = mysql.createConnection({
    host: "localhost",
    user: "max",
    password: "password"
});

con.connect((err: MysqlError) => {
    if (err) {
        throw err;
    }
    console.log("Connected to DB.");
});

con.end(() => {
    console.log("Connection to DB closed.");
});

// Create new express application instance.
const app: express.Application = express();
const port: number = 3000;

app.use(express.json());
app.use('/access', AccessController);

app.listen(port, () => {
    // Success.
});


