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
