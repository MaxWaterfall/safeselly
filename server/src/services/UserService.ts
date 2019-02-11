import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { HttpRequestError } from "../helper/HttpRequestError";
import * as log from "./../helper/Logger";
import * as UserRepository from "./../repositories/UserRepository";
import { sendFeedbackEmail } from "./EmailService";
import { sendRegisterEmail } from "./EmailService";

const expiryTime = 60000; // 1 minute.
const deviceTokenLength = 32;
const accessTokenLength = 32;
const verificationTokenLength = 32;
const accessTokenSaltRounds = 8;

// A map of devices which have not yet been added to the database
// as they are waiting for a verification email to be sent.
const tempDeviceList: Map<string, string> = new Map();

/**
 * Generates a 32 character long device id and adds it to the list, requires a username.
 * @param username
 */
export async function getDeviceToken(username: string): Promise<string> {
    if (username === undefined) {
        throw new HttpRequestError(400, "Username is not valid.");
    }

    // Generate token.
    let token = "";
    try {
        token = await crypto.randomBytes(deviceTokenLength).toString("hex");
    } catch (err) {
        log.tokenGenerationError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }

    // Add token to map.
    if (tempDeviceList.has(username)) {
        tempDeviceList.delete(username);
    }
    tempDeviceList.set(username, token);

    // Remove this id from the map after the timeout.
    setTimeout(() => {
        tempDeviceList.delete(username);
    }, expiryTime);

    return token;
}

/**
 * Sends a registration email to the provided username.
 * @param username
 * @param deviceToken
 */
export async function sendVerificationEmail(username: string, deviceToken: string): Promise<string> {

    // Check the username is valid.
    if (!tempDeviceList.has(username)) {
        throw new HttpRequestError(400, `Username ${username} does not have a valid device token.`);
    }

    // Check device id is valid.
    if (tempDeviceList.get(username) !== deviceToken) {
        throw new HttpRequestError(400, `Device token ${deviceToken} is not valid for username ${username}.`);
    }

    // Generate verification token (token that will be in the link sent to the user).
    let verificationToken = "";
    try {
        verificationToken = await crypto.randomBytes(verificationTokenLength).toString("hex");
    } catch (err) {
        log.tokenGenerationError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }

    // TODO: Check last email has not been sent within x minutes.
    // Add user to DB and device to DB.
    try {
        await UserRepository.addUser(username, deviceToken, verificationToken);
    } catch (err) {
        throw (err);
    }

    try {
        await sendRegisterEmail(username, verificationToken);
    } catch (err) {
        throw err;
    }

    return `Sent verification email to ${username}@bham.ac.uk.`;
}

/**
 * Verifies a user with a device.
 * @param verificationToken
 */
export async function verifyDevice(verificationToken: string) {
    try {
        await UserRepository.verifyDevice(verificationToken);
    } catch (err) {
        throw err;
    }
}

 /**
  * Returns an access token if the user has validated their email for this device id.
  * @param username
  * @param deviceToken
  */
export async function getAccessToken(username: string, deviceToken: string): Promise<string> {
    // Check user has been verified.
    try {
        const deviceVerified = await UserRepository.isDeviceVerified(username, deviceToken);
        if (!deviceVerified) {
            throw new HttpRequestError(400, "User has not been verified.");
        }
    } catch (err) {
        throw (err);
    }

    // Generate the access token.
    let accessToken = "";
    try {
        accessToken = await crypto.randomBytes(accessTokenLength).toString("hex");
    } catch (err) {
        log.tokenGenerationError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }

    // Hash and encrypt access token (it acts as a password).
    let hashedAccessToken = "";
    try {
        hashedAccessToken = await bcrypt.hash(accessToken, accessTokenSaltRounds);
    } catch (err) {
        log.encryptionError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }

    // Add token to database.
    try {
        await UserRepository.addAccessToken(username, hashedAccessToken);
    } catch (err) {
        throw err;
    }

    // We want the user to have the unencrypted version.
    return accessToken;
}

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
