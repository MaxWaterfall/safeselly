import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import {HttpRequestError} from "../helper/HttpRequestError";
import * as AccessRepository from "../repositories/AccessRepository";
import * as log from "./../helper/Logger";

const expiryTime = 60000; // 1 minute.
const deviceTokenLength = 32;
const accessTokenLength = 32;
const verificationTokenLength = 32;
const accessTokenSaltRounds = 8;

// A list of devices which have not yet been added to the database as they are waiting for email verification.
const tempDeviceList: Map<string, string> = new Map();

// Generate a 32 character long device id and add it to the list, requires a username.
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
    try {
        verificationToken = await crypto.randomBytes(verificationTokenLength).toString("hex");
    } catch (err) {
        log.tokenGenerationError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }

    // TODO: Check last email has not been sent within x minutes.
    // Add user to DB and device to DB.
    try {
        AccessRepository.addUser(username, deviceToken, verificationToken);
    } catch (err) {
        throw (err);
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
    // Check user has been verified.
    try {
        const deviceVerified = await AccessRepository.isDeviceVerified(username, deviceToken);
        if (!deviceVerified) {
            throw new HttpRequestError(400, "User has not been verified.");
        }
    } catch (err) {
        throw (err);
    }

    // Generate the access token.
    let accessToken = "";
    try {
        accessToken = crypto.randomBytes(accessTokenLength).toString("hex");
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
        await AccessRepository.addAccessToken(username, hashedAccessToken);
    } catch (err) {
        throw err;
    }

    // We want the user to have the unencrypted version.
    return accessToken;
}
