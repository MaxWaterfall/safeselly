import {db} from "./../Server";
import {HttpRequestError} from './../helper/HttpRequestError';

export module AccessRepository {
    let doesUserExistSql = "SELECT COUNT(UserId) FROM User WHERE Username = ?";
    let addUserSql = "INSERT INTO User (Username) VALUES (?)";
    let addDeviceSql = `
        INSERT INTO Device (UserId, DeviceToken, VerificationToken, Verified) 
        VALUES (
            (SELECT UserId FROM User WHERE Username = ?), ?, ?, false
        )
    `;
    let deviceVerifiedSql = `
        SELECT COUNT(UserId) FROM Device 
        WHERE 
            DeviceToken = ? AND 
            Verified = true AND
            UserId = 
                (SELECT UserId FROM User WHERE Username = ?)

    `;
    let addAccessTokenSql = `
        UPDATE Device
        SET AccessToken = ?
        WHERE DeviceToken = ? AND Device.UserId = 
            (SELECT UserId FROM User WHERE Username = ?)
    `;
    let verifyDeviceSql = "UPDATE Device SET Verified = true WHERE VerificationToken = ?";

    export async function doesUserExist(username: string): Promise<boolean> {
        try {
            let result = await db.query(doesUserExistSql, [username]) as any[];
            if (result[0]["COUNT(UserId)"] > 0) {
                return true;
            }
            return false;
        } catch (err) {
            //TODO: log error.
            throw new HttpRequestError(500, err);
        }
    }

    export async function addUser(username: string) {
        try {
            await db.query(addUserSql, [username]);
        } catch (err) {
            //TODO: log error.
            throw new HttpRequestError(500, err);
        }
    }

    export async function addDevice(username: string, deviceToken: string, verificationToken: string) {
        try {
            await db.query(addDeviceSql, [username, deviceToken, verificationToken]);
        } catch (err) {
            //TODO: log error.
            throw new HttpRequestError(500, err);
        }
    }

    export async function addAccessToken(username: string, deviceToken: string, accessToken: string) {
        try {
            await db.query(addAccessTokenSql, [accessToken, deviceToken, username]);
        } catch (err) {
            //TODO: log error.
            throw new HttpRequestError(500, err);
        }
    }

    export async function verifyDevice(verificationToken: string) {
        try {
            await db.query(verifyDeviceSql, [verificationToken]);
        } catch (err) {
            //TODO: log err.
            throw new HttpRequestError(500, err);
        }
    }

    export async function isDeviceVerified(username: string, deviceToken: string) {
        try {
            let result = await db.query(deviceVerifiedSql, [deviceToken, username]) as any[];
            if (result[0]["COUNT(UserId)"] > 0) {
                return true;
            }
            return false;
        } catch (err) {
            // TODO: log err.
            throw new HttpRequestError(500, err);
        }
    }
}