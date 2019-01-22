import * as log from "../helper/Logger";
import {HttpRequestError} from "./../helper/HttpRequestError";
import {db} from "./../Server";

const getAccessTokenSql = `
    SELECT AccessToken FROM Device, User
    WHERE (
        User.Username = ? AND User.UserId = Device.UserId AND
        DeviceToken = ?
    )
`;

/**
 * Returns the access token for a given username and deviceToken.
 */
export async function getAccessToken(username: string, deviceToken: string) {
    try {
        const result = await db.query(getAccessTokenSql, [username, deviceToken]) as any[];
        if (result.length > 0) {
            return result[0].AccessToken;
        }
        return "";
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}
