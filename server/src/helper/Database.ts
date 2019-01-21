import mysql from "mysql";

/**
 * A wrapper around the mysql API, it allows me to use promises instead of callbacks.
 */
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
                    return reject(err);
                }
                resolve();
            });
        });
    }

    public end() {
        return new Promise((resolve, reject) => {
            this.db.end(((err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            }));
        });
    }

    public query(sql: string, options: any) {
        return new Promise((resolve, reject) => {
            this.db.query(sql, options, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    }
}
