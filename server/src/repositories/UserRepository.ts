import * as log from "../helper/Logger";
import {HttpRequestError} from "./../helper/HttpRequestError";
import {db} from "./../Server";

const setFCMTokenSql = `
    UPDATE User
    SET fcmToken = ?
    WHERE username = ?
`;
const submitFeedbackSql = `
    INSERT INTO Feedback
    VALUES (NULL, ?, ?)
`;
const getAccessTokenSql = `
    SELECT accessToken FROM User
    WHERE username = ?
`;
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
const isUserBannedSql = `
    SELECT banned
    FROM User
    WHERE username = ?
`;
const banUserSql = `
    UPDATE User
    SET banned = true
    WHERE username = (
        SELECT username
        FROM Warning
        WHERE warningId = ?
    )
`;

/**
 * Adds a user into the database.
 * @param username
 * @param deviceToken
 * @param verificationToken
 */
export async function addUser(username: string, deviceToken: string, verificationToken: string) {
    try {
        await db.query(addUserSql, [username, deviceToken, verificationToken, deviceToken, verificationToken]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}

/**
 * Adds an access-token for a user.
 * @param username
 * @param accessToken
 */
export async function addAccessToken(username: string, accessToken: string) {
    try {
        await db.query(addAccessTokenSql, [accessToken, username]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, err);
    }
}

/**
 * Verifies a user with a device.
 * @param verificationToken
 */
export async function verifyDevice(verificationToken: string) {
    try {
        const result = await db.query(verifyDeviceSql, [verificationToken]) as any;
        return result.affectedRows > 0;
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}

/**
 * Checks whether a user and device have been verified.
 * @param username
 * @param deviceToken
 */
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

/**
 * Returns the access token for a given username and deviceToken.
 * @param username
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

/**
 * Updates the users FCM Token.
 * @param username
 * @param fcmToken
 */
export async function setFCMToken(username: string, fcmToken: string) {
    try {
        await db.query(setFCMTokenSql, [fcmToken, username]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Adds feedback for this user.
 * @param username
 * @param feedback
 */
export async function submitFeedback(username: string, feedback: string) {
    try {
        await db.query(submitFeedbackSql, [username, feedback]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Checks if a user has been banned.
 * @param username
 */
export async function isUserBanned(username: string) {
    try {
        const result = await db.query(isUserBannedSql, [username]) as any[];
        if (result.length > 0) {
            if (result[0]["banned"] === null) {
                return false;
            }
            return result[0]["banned"] === 1;
        }
        return false;
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Bans a user.
 * @param warningId
 */
export async function banUser(warningId: string) {
    try {
        await db.query(banUserSql, [warningId]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}
