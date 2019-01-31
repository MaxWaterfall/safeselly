import * as log from "../helper/Logger";
import {HttpRequestError} from "./../helper/HttpRequestError";
import {db} from "./../Server";

const doesUserExistSql = "SELECT COUNT(username) FROM User WHERE username = ?";
const addUserSql = "INSERT INTO User (username) VALUES (?)";
const addDeviceSql = `
    INSERT INTO Device (deviceToken, username, verificationToken, verified)
    VALUES (
        ?, ?, ?, false
    )
`;
const deviceVerifiedSql = `
    SELECT COUNT(username) FROM Device
    WHERE
        deviceToken = ? AND
        verified = true AND
        username = ?
`;
const addAccessTokenSql = `
    UPDATE User
    SET accessToken = ?
    WHERE username = ?
`;
const verifyDeviceSql = "UPDATE Device SET verified = true WHERE verificationToken = ?";

export async function doesUserExist(username: string): Promise<boolean> {
    try {
        const result = await db.query(doesUserExistSql, [username]) as any[];
        if (result[0]["COUNT(username)"] > 0) {
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
        await db.query(addDeviceSql, [deviceToken, username, verificationToken]);
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
        const result = await db.query(deviceVerifiedSql, [deviceToken, username]) as any[];
        if (result[0]["COUNT(username)"] > 0) {
            return true;
        }
        return false;
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}
