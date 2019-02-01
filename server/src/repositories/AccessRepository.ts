import * as log from "../helper/Logger";
import {HttpRequestError} from "./../helper/HttpRequestError";
import {db} from "./../Server";

const addUserSql = `
    INSERT INTO User (username, deviceToken, verificationToken, verified)
    VALUES (?, ?, ?, false)
    ON DUPLICATE KEY UPDATE
        deviceToken = ?,
        verificationToken = ?,
        verified = false
`;
const addAccessTokenSql = `
    UPDATE User
    SET accessToken = ?
    WHERE username = ?
`;
const verifyDeviceSql = "UPDATE User SET verified = true WHERE verificationToken = ?";
const deviceVerifiedSql = `
    SELECT verified FROM User
    WHERE username = ? AND deviceToken = ?
`;

export async function addUser(username: string, deviceToken: string, verificationToken: string) {
    try {
        await db.query(addUserSql, [username, deviceToken, verificationToken, deviceToken, verificationToken]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}

export async function addAccessToken(username: string, accessToken: string) {
    try {
        await db.query(addAccessTokenSql, [accessToken, username]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, err);
    }
}

export async function verifyDevice(verificationToken: string) {
    try {
        await db.query(verifyDeviceSql, [verificationToken]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}

export async function isDeviceVerified(username: string, deviceToken: string) {
    try {
        const result = await db.query(deviceVerifiedSql, [username, deviceToken]) as any[];
        if (result[0]["verified"] === 1) {
            return true;
        }
        return false;
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}
