import * as bcrypt from "bcrypt";
import * as UserRepository from "../repositories/USerRepository";
import {HttpRequestError} from "./../helper/HttpRequestError";
import * as log from "./../helper/Logger";

export async function isRequestAuthorised(username: string, accessToken: string) {
    if (username === undefined) {
        throw new HttpRequestError(400, "Username is not valid.");
    }

    if (accessToken === undefined) {
        throw new HttpRequestError(400, "Access token is not valid.");
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
}
