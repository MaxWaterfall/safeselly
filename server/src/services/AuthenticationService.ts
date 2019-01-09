import * as AuthenticationRepository from "../repositories/AuthenticationRepository";
import {HttpRequestError} from "./../helper/HttpRequestError";
import * as log from "./../helper/Logger";

export async function isRequestAuthorised(username: string, deviceToken: string, accessToken: string) {
    if (username === undefined) {
        throw new HttpRequestError(400, "Username is not valid.");
    }

    if (deviceToken === undefined) {
        throw new HttpRequestError(400, "Device id is not valid.");
    }

    if (accessToken === undefined) {
        throw new HttpRequestError(400, "Access token is not valid.");
    }

    // Make database call to check if all 3 are valid.
    // TODO: implement caching to save on database calls.
    try {
        const result = await AuthenticationRepository.isRequestAuthorised(username, deviceToken, accessToken);
        if (!result) {
            // Forbidden.
            throw new HttpRequestError(403, "Credentials given do not have access to this route.");
        }
    } catch (err) {
        throw err;
    }
}
