import * as log from "../helper/Logger";
import {HttpRequestError} from "./../helper/HttpRequestError";
import {db} from "./../Server";

const getAccessTokenSql = `
    SELECT accessToken FROM User
    WHERE username = ?
`;

/**
 * Returns the access token for a given username and deviceToken.
 */
export async function getAccessToken(username: string) {
    try {
        const result = await db.query(getAccessTokenSql, [username]) as any[];
        if (result.length > 0) {
            return result[0].accessToken;
        }
        return "";
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}
