import {HttpRequestError} from "../helper/HttpRequestError";
import * as AccessRepository from "../repositories/AccessRepository";

const expiryTime = 60000; // 1 minute.
const deviceTokenLength = 32;
const accessTokenLength = 32;
const verificationTokenLength = 32;
const chars = "123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// A list of devices which have not yet been added to the database as they are waiting for email verification.
const tempDeviceList: Map<string, string> = new Map();

// Generate a 32 character long device id and add it to the list, requires valid username.
export async function getDeviceToken(username: string): Promise<string> {
    if (username === undefined) {
        throw new HttpRequestError(400, "Username is not valid.");
    }

    // Generate token.
    let deviceToken = "";
    for (let i = 0; i < deviceTokenLength; i++) {
        deviceToken += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Add token to map.
    if (tempDeviceList.has(username)) {
        tempDeviceList.delete(username);
    }
    tempDeviceList.set(username, deviceToken);

    // Remove this id from the map after the timeout.
    setTimeout(() => {
        tempDeviceList.delete(username);
    }, expiryTime);

    return deviceToken;
}

// Sends an email to the provided username.
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
    for (let i = 0; i < verificationTokenLength; i++) {
        verificationToken += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // TODO: Check last email has not been sent within x minutes.
    // Add user to DB (if they don't already exist).
    try {
        const userExists = await AccessRepository.doesUserExist(username);
        if (userExists) {
            // Add device only.
            await AccessRepository.addDevice(username, deviceToken, verificationToken);
        } else {
            // Add device and user.
            await AccessRepository.addUser(username);
            await AccessRepository.addDevice(username, deviceToken, verificationToken);
        }
    } catch (err) {
        throw err;
    }

    // TODO: Send the email.

    return `Sent verification email to ${username}@bham.ac.uk.`;
}

// Validates a user by checking the token in the link they were emailed.
export async function verifyDevice(verificationToken: string) {
    try {
        await AccessRepository.verifyDevice(verificationToken);
    } catch (err) {
        throw err;
    }
}

// Returns an access token if the user has validated their email for this device id.
export async function getAccessToken(username: string, deviceToken: string): Promise<string> {
    // Check user has been validated.
    try {
        const deviceVerified = await AccessRepository.isDeviceVerified(username, deviceToken);
        if (!deviceVerified) {
            throw new HttpRequestError(400, "Device has not been verified.");
        }
    } catch (err) {
        throw (err);
    }

    // Generate the access token.
    let accessToken = "";
    for (let i = 0; i < accessTokenLength; i++) {
        accessToken += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Add token to database.
    try {
        await AccessRepository.addAccessToken(username, deviceToken, accessToken);
    } catch (err) {
        throw err;
    }

    return accessToken;
}
