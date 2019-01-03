import { ReturnValue } from "../helper/ReturnValue";

export module AccessService {

    const expiryTime = 60000; // 1 minute.
    const deviceIdLength = 32;
    const accessTokenLength = 32;
    const chars = "123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // A list of devices which have not yet been added to the database as they are waiting for email verification.
    let tempDeviceList: Map<string, string> = new Map();

    // Generate a 32 character long device id and add it to the list, requires valid username.
    export function getDeviceId(username: string) : ReturnValue<string> {
        //TODO: Check username is valid.
        if (username == undefined) {
            return {
                error: true,
                errorMessage: "Username is not valid."
            }
        }
        //TODO: Check username doesn't already have valid id.

        // Generate id.
        let generatedId = "";
        for (let i = 0; i < deviceIdLength; i++) {
            generatedId += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Add id to map.
        tempDeviceList.set(username, generatedId);
        
        // Remove this id from the map after the timeout.
        setTimeout(() => {
            tempDeviceList.delete(username);
        }, expiryTime);
     
        return {
            error: false,
            value: generatedId
        };
    }

    // Sends an email to the provided username.
    export function sendVerificationEmail(username: string, deviceId: string): ReturnValue<string> {
        // Check the username is valid.
        if (!tempDeviceList.has(username)) {
            return {
                error: true,
                errorMessage: `Username ${username} does not have a valid deviceId.`
            };
        }

        // Check device id is valid.
        if (tempDeviceList.get(username) !== deviceId) {
            return {
                error: true,
                errorMessage: `Device id ${deviceId} is not valid for username ${username}.`
            };
        }

        //TODO: Check last email has not been sent within x mintues.
        //TODO: Send the email.
    
        return {
            error: false,
            value: `Sent verification email to ${username}@bham.ac.uk.`
        };
    }

    // Returns an access token if the user has validated their email for this device id.
    export function getAccessToken(username: string, deviceId: string): ReturnValue<string> {
        //TODO: Check the username has been validated (via email) for this device id.

        // Generate the access token.
        let generatedToken = "";
        for (let i = 0; i < accessTokenLength; i++) {
            generatedToken += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        //TODO: Add access token to database.
        
        return {
            error: false,
            value: generatedToken
        };
    }
}