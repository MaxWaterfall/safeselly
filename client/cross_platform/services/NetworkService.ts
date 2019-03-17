import { getUserCredentials, IUserCredentials } from "../data/CredentialStorage";

// const requestURL = "http://10.0.2.2:3000/safeselly/v1";
// const requestURL = "https://max.abmackenzie.com/safeselly/v1";
const requestURL = "https://maxwaterfall.com/safeselly/demo";

/**
 * This function is a wrapper around fetch that handles errors and differently formatted responses.
 * This version allows for authenticated requests.
 * @param method Http method. Eg. GET, POST.
 * @param path The path in the url. Eg. "/users".
 * @param body The body of the request that will be sent, as a JSON object.
 */
export async function makeAuthenticatedRequest(method: string, path: string, body: {}) {
    let credentials: IUserCredentials;
    try {
        credentials = await getUserCredentials();
    } catch (err) {
        // TODO: User needs to re-register if this happens.
        throw new Error("Error, try again.");
    }

    let requestInit = {
        method,
        headers: {
            "Content-Type": "application/json",
            "username": credentials.username,
            "access-token": credentials.accessToken,
        },
    };

    if (method === "POST") {
        requestInit = {...requestInit, ...{body: JSON.stringify(body)}};
    }

    const response = await fetch(requestURL + path, requestInit);
    return parseResponse(response);
}

/**
 * This function is a wrapper around fetch that handles errors and differently formatted responses.
 * This version allows a custom header to be sent.
 * @param method Http method. Eg. GET, POST.
 * @param path The path in the url. Eg. "/users".
 * @param header The HTTP header to be sent in the request.
 * @param body The body of the request that will be sent, as a JSON object.
 */
export async function makeRequest(method: string, path: string, header: {}, body: {}) {
    let requestInit = {
        method,
        headers: {...{
            "Content-Type": "application/json",
        }, ...header},
    };

    if (method === "POST") {
        requestInit = {...requestInit, ...{body: JSON.stringify(body)}};
    }

    const response = await fetch(requestURL + path, requestInit);
    return parseResponse(response);
}

/**
 * Returns a parsed response body.
 * @param response
 */
async function parseResponse(response: Response) {
    let responseBody;
    if (response.headers.get("Content-Type")!.includes("application/json")) {
        // Parse the body into JSON so we can read it.
        responseBody = await response.json();
        if (!response.ok) {
            throw new Error(responseBody);
        }

        // Return the body as a JSON object.
        return responseBody;
    }

    responseBody = await response.text();
    if (!response.ok) {
        throw new Error(responseBody);
    }
    return responseBody;
}
