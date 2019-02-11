import { HttpRequestError } from "../helper/HttpRequestError";
import * as UserRepository from "./../repositories/UserRepository";
import { sendFeedbackEmail } from "./EmailService";

/**
 * Updates the users fcm token in the database.
 * @param username
 * @param token
 */
export async function setFCMToken(username: string, fcmToken: string) {
    if (fcmToken === undefined || fcmToken.length === 0) {
        throw new HttpRequestError(400, "fcmToken is not valid.");
    }

    try {
       await UserRepository.setFCMToken(username, fcmToken);
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

    // Add to database.
    try {
        await UserRepository.submitFeedback(username, feedback);
    } catch (err) {
        throw err;
    }

    // Send email to myself.
    try {
        await sendFeedbackEmail(username, feedback);
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
