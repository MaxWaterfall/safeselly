import { Location } from "../../../shared/Warnings";
import * as log from "../helper/Logger";
import { IUserInformation } from "../warnings/WarningHelper";
import {HttpRequestError} from "./../helper/HttpRequestError";
import {db} from "./../Server";

const setFCMTokenSql = `
    UPDATE User
    SET fcmToken = ?
    WHERE username = ?
`;
const getFCMTokenSql = `
    SELECT fcmToken
    FROM User
    WHERE username = ?
`;
const submitFeedbackSql = `
    INSERT INTO Feedback
    VALUES (NULL, ?, ?)
`;
const getAccessTokenSql = `
    SELECT accessToken FROM User
    WHERE username = ?
`;
const addUserSql = `
    INSERT INTO User (username, deviceToken, verificationToken, verified)
    VALUES (?, ?, ?, false)
    ON DUPLICATE KEY UPDATE
        deviceToken = ?,
        verificationToken = ?,
        verified = false
`;
const addAccessTokenSql = `
    UPDATE User
    SET accessToken = ?
    WHERE username = ?
`;
const verifyDeviceSql = "UPDATE User SET verified = true WHERE verificationToken = ?";
const deviceVerifiedSql = `
    SELECT verified FROM User
    WHERE username = ? AND deviceToken = ?
`;
const isUserBannedSql = `
    SELECT banned
    FROM User
    WHERE username = ?
`;
const banUserSql = `
    UPDATE User
    SET banned = true
    WHERE username = (
        SELECT username
        FROM Warning
        WHERE warningId = ?
    )
`;
const updateLastRequestSql = `
    UPDATE User
    SET lastRequest = ?
    WHERE username = ?
`;
const getUserInformationSql = `
    SELECT * FROM UserInformation
    WHERE username = ?
`;
const getUserLocationsSql = `
    SELECT * FROM UserLocation
    WHERE username = ?
`;
const getAllUsersInformationSql = `
    SELECT * FROM UserInformation
`;
/**
 * Adds a user into the database.
 * @param username
 * @param deviceToken
 * @param verificationToken
 */
export async function addUser(username: string, deviceToken: string, verificationToken: string) {
    try {
        await db.query(addUserSql, [username, deviceToken, verificationToken, deviceToken, verificationToken]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}

/**
 * Adds an access-token for a user.
 * @param username
 * @param accessToken
 */
export async function addAccessToken(username: string, accessToken: string) {
    try {
        await db.query(addAccessTokenSql, [accessToken, username]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, err);
    }
}

/**
 * Verifies a user with a device.
 * @param verificationToken
 */
export async function verifyDevice(verificationToken: string) {
    try {
        const result = await db.query(verifyDeviceSql, [verificationToken]) as any;
        return result.affectedRows > 0;
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}

/**
 * Checks whether a user and device have been verified.
 * @param username
 * @param deviceToken
 */
export async function isDeviceVerified(username: string, deviceToken: string) {
    try {
        const result = await db.query(deviceVerifiedSql, [username, deviceToken]) as any[];
        if (result[0]["verified"] === 1) {
            return true;
        }
        return false;
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}

/**
 * Returns the access token for a given username and deviceToken.
 * @param username
 */
export async function getAccessToken(username: string) {
    try {
        const result = await db.query(getAccessTokenSql, [username]) as any[];
        if (result.length > 0) {
            return result[0].accessToken;
        }
        return "";
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Updates the users FCM Token.
 * @param username
 * @param fcmToken
 */
export async function setFCMToken(username: string, fcmToken: string) {
    try {
        await db.query(setFCMTokenSql, [fcmToken, username]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Gets a users' FCM Token.
 * @param username
 */
export async function getFCMToken(username: string) {
    try {
        const result = await db.query(getFCMTokenSql, [username]) as any[];
        return result[0]["fcmToken"];
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Adds feedback for this user.
 * @param username
 * @param feedback
 */
export async function submitFeedback(username: string, feedback: string) {
    try {
        await db.query(submitFeedbackSql, [username, feedback]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Checks if a user has been banned.
 * @param username
 */
export async function isUserBanned(username: string) {
    try {
        const result = await db.query(isUserBannedSql, [username]) as any[];
        if (result.length > 0) {
            if (result[0]["banned"] === null) {
                return false;
            }
            return result[0]["banned"] === 1;
        }
        return false;
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Bans a user.
 * @param warningId
 */
export async function banUser(warningId: string) {
    try {
        await db.query(banUserSql, [warningId]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Updates the users last request with the given date.
 * @param username
 * @param date
 */
export async function updateLastRequest(username: string, date: string) {
    try {
        await db.query(updateLastRequestSql, [date, username]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Retrieves the user information for a single user.
 * @param username
 */
export async function getUserInformation(username: string): Promise<IUserInformation> {
    try {
        const databaseUserInfo = await db.query(getUserInformationSql, [username]) as any;
        const userInfo = createUserInformation(username, databaseUserInfo[0]);
        return userInfo;
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Retrieves the user information for all users.
 */
export async function getAllUsersInformation(): Promise<IUserInformation[]> {
    try {
        const databaseUsersInfo = await db.query(getAllUsersInformationSql, []) as any[];
        // Create the user information objects for all users.
        const usersInfo = await Promise.all(databaseUsersInfo.map(async (info, index) => {
            const username = databaseUsersInfo[index]["username"];
            return await createUserInformation(username, info);
        }));
        return usersInfo;
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Takes user information that was pulled from the database and returns a valid
 * IUserInformation object. Also gets the frequent user locations from the database.
 * This function must only be called from functions in this file as it does not contain
 * a try catch block.
 * @param databaseUserInfo
 */
async function createUserInformation(username: string, databaseUserInfo: any): Promise<IUserInformation> {
    const databaseUserLocations = await db.query(getUserLocationsSql, [username]) as any[];

    let gender = databaseUserInfo["gender"];
    if (gender === null) {
        gender = "UNKNOWN";
    }

    // Ensure home location is either a Location or undefined.
    let homeLocation: Location | undefined = {
        lat: databaseUserInfo["homeLatitude"] as number,
        long: databaseUserInfo["homeLongitude"] as number,
    };
    if (homeLocation.lat === null || homeLocation.long === null) {
        homeLocation = undefined;
    }

    // Ensure last known location is either a Location or undefined.
    let lastKnownLocation: Location | undefined = {
        lat: databaseUserInfo["currentLatitude"],
        long: databaseUserInfo["currentLongitude"],
    };
    if (lastKnownLocation.lat === null || lastKnownLocation.long === null) {
        lastKnownLocation = undefined;
    }

    const frequentLocations =  databaseUserLocations.map((location) => {
        return {
            lat: location.latitude,
            long: location.longitude,
        };
    });

    const ownsBicycle = databaseUserInfo["ownsBicycle"];
    const ownsCar = databaseUserInfo["ownsCar"];
    const ownsLaptop = databaseUserInfo["ownsLaptop"];
    const userInfo: IUserInformation = {
        username,
        gender,
        homeLocation,
        lastKnownLocation,
        frequentLocations,
        ownsBicycle,
        ownsCar,
        ownsLaptop,
    };

    return userInfo;
}
