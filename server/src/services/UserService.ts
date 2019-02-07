import { HttpRequestError } from "../helper/HttpRequestError";
import * as UserRepository from "./../repositories/UserRepository";

/**
 * Updates the users fcm token in the database.
 * @param username
 * @param token
 */
export async function setFCMToken(username: string, fcmToken: string) {
    try {
        UserRepository.setFCMToken(username, fcmToken);
    } catch (err) {
        throw err;
    }
}
