import * as Keychain from "react-native-keychain";

export interface IUserCredentials {
    username: string;
    accessToken: string;
}

/**
 * Stores the user credentials into the secure keystore.
 */
export async function setUserCredentials(credentials: IUserCredentials) {
    try {
        await Keychain.setGenericPassword(credentials.username, credentials.accessToken);
    } catch (err) {
        throw err;
    }
}

/**
 * Retrieves the user credentials from the keystore.
 */
export async function getUserCredentials(): Promise<IUserCredentials> {
    try {
        let credentials = await Keychain.getGenericPassword();
        // Convert Keychain credentials into UserCredentials.
        if (!credentials) {
            throw new Error("Error: no credentials saved.");
        }
        // Credentials can be a boolean or this object, so we need to tell the compiler it's this object.
        credentials = credentials as {
            service: string,
            username: string,
            password: string,
        };

        const username = credentials.username;
        const accessToken = credentials.password;

        return {
            username,
            accessToken,
        };
    } catch (err) {
        throw err;
    }
}
