import mysql, { PoolConnection } from "mysql";

/**
 * A wrapper around the mysql API, it allows me to use promises instead of callbacks.
 */
export class Database {
    private pool: mysql.Pool;

    constructor(config: mysql.PoolConfig) {
        // Set up DB connection.
        this.pool = mysql.createPool(config);
    }

    public async query(sql: string, options: any) {
        return new Promise(async (resolve, reject) => {
            let connection: PoolConnection;
            try {
                connection = await this.getConnection();
            } catch (err) {
                return reject(err);
            }

            connection.query(sql, options, (err, result) => {
                if (err) {
                    connection.release();
                    return reject(err);
                }
                connection.release();
                resolve(result);
            });
        });
    }

    private getConnection(): Promise<PoolConnection> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    return reject(err);
                }
                resolve(connection);
            });
        });
    }
}
