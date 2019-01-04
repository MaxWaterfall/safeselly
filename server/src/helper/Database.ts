import mysql from "mysql";

// This class is a wrapper around the mysql API, it allows me to use promises instead of callbacks.
export class Database {
    private db: mysql.Connection;

    constructor(config: mysql.ConnectionConfig) {
        // Set up DB connection.
        this.db = mysql.createConnection(config);
    }

    public connect() {
        return new Promise((resolve, reject) => {
            this.db.connect((err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    public end() {
        return new Promise((resolve, reject) => {
            this.db.end((err => {
                if (err) {
                    reject(err);
                }
                resolve();
            }));
        });
    }

    public query(sql: string, options: string | mysql.QueryOptions) {
        return new Promise((resolve, reject) => {
            this.db.query(sql, options, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }
}