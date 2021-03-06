import * as bcrypt from "bcrypt";
import * as UserRepository from "../repositories/UserRepository";
import {HttpRequestError} from "./../helper/HttpRequestError";
import * as log from "./../helper/Logger";
import * as WarningService from "./WarningService";

export async function isRequestAuthorised(username: string, accessToken: string) {
    if (username === undefined) {
        throw new HttpRequestError(400, "Username is not valid.");
    }

    if (accessToken === undefined) {
        throw new HttpRequestError(400, "Access token is not valid.");
    }

    // Check if user is banned.
    try {
        const banned = await UserRepository.isUserBanned(username);
        if (banned) {
            throw new HttpRequestError(403, "You are banned due to abuse.");
        }
    } catch (err) {
        throw err;
    }

    // Get encrypted access token from database.
    // TODO: implement caching to save on database calls.
    let hashedAccessToken = "";
    try {
        hashedAccessToken = await UserRepository.getAccessToken(username);
    } catch (err) {
        throw err;
    }

    // Verify access tokens match.
    let validCredentials = false;
    try {
        validCredentials = await bcrypt.compare(accessToken, hashedAccessToken);
    } catch (err) {
        log.encryptionError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }

    if (!validCredentials) {
        // Check username is valid.
        // TODO: See above, add logging to track unauthorised access attempts.
        throw new HttpRequestError(400, "Credentials are not valid.");
    }

    // User is authorised, update the time they last made a request.
    try {
        await UserRepository.updateLastRequest(username, WarningService.getDate());
    } catch (err) {
        throw err;
    }
}
