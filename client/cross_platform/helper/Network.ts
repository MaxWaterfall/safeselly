import {Alert} from "react-native";
import {getUserCredentials, UserCredentials} from "./UserCredentials";

const requestURL = "http://10.0.2.2:3000";

/**
 * This function is a wrapper around fetch that handles errors and differently formatted responses.
 * @param method Http method. Eg. GET, POST.
 * @param path The path in the url. Eg. "/users".
 * @param authentication Whether this requires authentication.
 * @param body The body of the request that will be sent, as a JSON object.
 */
export async function makeRequest(method: string, path: string, authentication: boolean, body: {}) {
    try {
        let reqBody = body;
        if (authentication) {
            const credentials: UserCredentials = await getUserCredentials();
            // Combine the body provided with the user credentials.
            reqBody = {...reqBody, ...{
                username: credentials.username,
                device_token: credentials.deviceToken,
                access_token: credentials.accessToken,
            }};
        }
        const response = await fetch(requestURL + path, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reqBody),
        });

        let responseBody;
        if (response.headers.get("Content-Type")!.includes("application/json")) {
            // Parse the body into JSON so we can read it.
            responseBody = await response.json();
            if (!response.ok) {
                throw new HttpRequestError(response.status, responseBody.error);
            }

            // Return the body as a JSON object.
            return responseBody;
        }

        responseBody = await response.text();
        if (!response.ok) {
            throw new HttpRequestError(response.status, responseBody);
        }
        return responseBody;
    } catch (err) {
        throw err;
    }
}

export class HttpRequestError extends Error {
    constructor(public status: number, public message: string) {
        super(message);
    }
}

export function handleNetworkError(error: any) {
    if (error instanceof HttpRequestError) {
        Alert.alert("Error", error.message);
    } else {
        // console.log(error);
        Alert.alert("Error", "Please try again.");
    }
}
