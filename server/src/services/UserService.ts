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

/**
 * Validates then adds feedback for this user into the database.
 * @param username
 * @param feedback
 */
export async function submitFeedback(username: string, feedback: string) {
    // Validate.
    if (!validateFeedback(feedback)) {
        throw new HttpRequestError(400, "Feedback is not valid.");
    }

    try {
        UserRepository.submitFeedback(username, feedback);
    } catch (err) {
        throw err;
    }
}

/**
 * Checks the given feedback is valid.
 * @param feedback
 */
function validateFeedback(feedback: string): boolean {
    if (feedback === undefined) {
        return false;
    }

    if (feedback.length === 0) {
        return false;
    }

    return true;
}
