import * as log from "../helper/Logger";
import {HttpRequestError} from "./../helper/HttpRequestError";
import {db} from "./../Server";

const doesUserExistSql = "SELECT COUNT(UserId) FROM User WHERE Username = ?";
const addUserSql = "INSERT INTO User (Username) VALUES (?)";
const addDeviceSql = `
    INSERT INTO Device (UserId, DeviceToken, VerificationToken, Verified)
    VALUES (
        (SELECT UserId FROM User WHERE Username = ?), ?, ?, false
    )
`;
const deviceVerifiedSql = `
    SELECT COUNT(UserId) FROM Device
    WHERE
        DeviceToken = ? AND
        Verified = true AND
        UserId =
            (SELECT UserId FROM User WHERE Username = ?)

`;
const addAccessTokenSql = `
    UPDATE Device
    SET AccessToken = ?
    WHERE DeviceToken = ? AND Device.UserId =
        (SELECT UserId FROM User WHERE Username = ?)
`;
const verifyDeviceSql = "UPDATE Device SET Verified = true WHERE VerificationToken = ?";

export async function doesUserExist(username: string): Promise<boolean> {
    try {
        const result = await db.query(doesUserExistSql, [username]) as any[];
        if (result[0]["COUNT(UserId)"] > 0) {
            return true;
        }
        return false;
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}

export async function addUser(username: string) {
    try {
        await db.query(addUserSql, [username]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}

export async function addDevice(username: string, deviceToken: string, verificationToken: string) {
    try {
        await db.query(addDeviceSql, [username, deviceToken, verificationToken]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}

export async function addAccessToken(username: string, deviceToken: string, accessToken: string) {
    try {
        await db.query(addAccessTokenSql, [accessToken, deviceToken, username]);
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
        const result = await db.query(deviceVerifiedSql, [deviceToken, username]) as any[];
        if (result[0]["COUNT(UserId)"] > 0) {
            return true;
        }
        return false;
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}
