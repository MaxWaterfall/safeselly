import * as Keychain from 'react-native-keychain';

export interface UserCredentials {
    username: string,
    deviceToken: string,
    accessToken: string,
}

/**
 * Stores the user credentials into the secure keystore.
 */
export async function setUserCredentials(credentials: UserCredentials) {
    let usernameString = credentials.username + ":" + credentials.deviceToken;
    try {
        await Keychain.setGenericPassword(usernameString, credentials.accessToken);
    } catch (err) {
        throw err;
    }
}

/**
 * Retrieves the user credentials from the keystore.
 */
export async function getUserCredentials(): Promise<UserCredentials> {
    try {
        let credentials = await Keychain.getGenericPassword();
        // Convert Keychain credentials into UserCredentials.
        if (!credentials) {
            //TODO: Throw error.
        }
        // Credentials can be a boolean or this object, so we need to tell the compiler it's this object.
        credentials = credentials as {
            service: string,
            username: string,
            password: string,
        }
        // Username and deviceToken are separated by a colon.
        const colonIndex = credentials.username.indexOf(":");
        const username = credentials.username.substring(0, colonIndex);
        const deviceToken = credentials.username.substring(colonIndex);
        const accessToken = credentials.password;
        
        return {
            username: username,
            deviceToken: deviceToken,
            accessToken: accessToken,
        }
    } catch (err) {
        throw err;
    }
}
