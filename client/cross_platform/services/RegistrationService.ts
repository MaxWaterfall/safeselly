import { setUserCredentials } from "../data/CredentialStorage";
import { getItem, setItem } from "./../data/DataStorage";
import { makeRequest } from "./NetworkService";

const MAX_USERNAME_LENGTH = 10;
const MIN_USERNAME_LENGTH = 4;

let usernameGlobal = "";
let deviceTokenGlobal = "";

export function getUsername() {
    return usernameGlobal;
}

/**
 * Checks whether the given username is valid.
 * Throws an error if it is not.
 * @param username
 */
function validateUsername(username: string) {
    if (username === "") {
        throw new Error("No username has been entered.");
    }

    if (username.length > MAX_USERNAME_LENGTH) {
        throw new Error("Username is too long.");
    }

    if (username.length < MIN_USERNAME_LENGTH) {
        throw new Error("Username is too short.");
    }
}

/**
 * Starts the registration process.
 * Calls endpoints /access/device-token and /access/send-email.
 * @param username
 */
export async function startRegistration(username: string): Promise<void> {
    validateUsername(username);
    usernameGlobal = username.toUpperCase();

    try {
        const response = await makeRequest("GET", "/access/device-token", {username: usernameGlobal}, {});
        deviceTokenGlobal = response.device_token;
        await makeRequest("GET", "/access/send-email", getHeader(), {});

        // Save the state so if the user quits we go back to this screen.
        await saveRegistrationState();
    } catch (err) {
        throw err;
    }
}

/**
 * Saves the current registration state, so if the user quits the app, they can go back to where they were.
 */
async function saveRegistrationState() {
    const usernameSet = setItem("username", usernameGlobal);
    const deviceTokenSet = setItem("deviceToken", deviceTokenGlobal);
    Promise.all([usernameSet, deviceTokenSet])
        .catch((err) => {
            // Do nothing.
        });
}

/**
 * Loads the current registration state.
 * @returns a boolean representing whether the state could be loaded or not.
 */
export async function loadRegistrationState(): Promise<boolean> {
    try {
        const username = await getItem("username");
        const deviceToken = await getItem("deviceToken");

        if (username === null || deviceToken === null) {
            return false;
        }

        // Set the global variables.
        usernameGlobal = username;
        deviceTokenGlobal = deviceToken;
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Finishes the registration process.
 * Calls endpoint /access/access-token.
 */
export async function finishRegistration() {
    try {
        const response = await makeRequest("GET", "/access/access-token", getHeader(), {});
        // Save user credentials
        await setUserCredentials({username: usernameGlobal, accessToken: response.access_token});
        // Update local storage
        await setRegistered();
    } catch (err) {
        throw err;
    }
}

export async function isRegistered() {
    try {
        const value = await getItem("registered");
        if (value === "true") {
            return true;
        } else if (value === "false") {
            return false;
        }
    } catch (err) {
        return false;
    }
}

async function setRegistered() {
    try {
        await setItem("registered", "true");
    } catch (err) {
        throw err;
    }
}

function getHeader() {
    return {
        "username": usernameGlobal,
        "device-token": deviceTokenGlobal,
    };
}
