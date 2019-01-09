import * as log from "../helper/Logger";
import {HttpRequestError} from "./../helper/HttpRequestError";
import {db} from "./../Server";

const isRequestAuthorisedSql = `
    SELECT COUNT(User.UserId) FROM Device, User
    WHERE (
        User.Username = ? AND User.UserId = Device.UserId AND
        DeviceToken = ? AND AccessToken = ?
    )
`;

export async function isRequestAuthorised(username: string, deviceToken: string, accessToken: string) {
    try {
        const result = await db.query(isRequestAuthorisedSql, [username, deviceToken, accessToken]) as any[];
        if (result[0]["COUNT(User.UserId)"] > 0) {
            return true;
        }
        return false;
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}
