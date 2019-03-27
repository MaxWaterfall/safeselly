import axios from "axios";
import * as admin from "firebase-admin";
import { IWarning, prettyType } from "../../../shared/Warnings";
import { INotification, NotificationType } from "../helper/Notification";
import * as log from "./../helper/Logger";
import * as UserRepository from "./../repositories/UserRepository";
import { config } from "./../Server";
import * as serviceAccount from "./../serviceAccountKey.json";
import { createWarning } from "./../warnings/WarningHelper";

/**
 * The minimum relevance score required to send a notification to a user.
 */
const MINIMUM_NOTIFICATION_RELEVANCE = 4;
/**
 * Initialise the Firebase Admin SDK.
 */
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

/**
 * Send a notification to app user with given fcmToken.
 * @param notification
 * @param fcmToken
 */
export async function sendNotification(notification: INotification, fcmToken: string) {
    let data;
    if (notification.type === NotificationType.USER_SUBMITTED) {
        data = {warning: JSON.stringify(notification.warning)};
    } else {
        // TODO: Add payload for SERVER_GENERATED notifications.
    }

    // Create the message.
    const message = {
        // topic: process.env.NODE_ENV === "production" ? "all-prod" : "testing",
        token: fcmToken,
        android: {
            priority: "high",
            notification: {
                title: notification.title,
                body: notification.body,
                sound: "default",
            },
        },
        data,
    };

    // Send the message.
    try {
        await admin.messaging().send(message as any);
        if (notification.type === NotificationType.USER_SUBMITTED) {
            log.info("Sent notification for user-submitted-warning. Type: " + notification.warning!.type);
        } else {
            log.info("Sent notification.");
        }

    } catch (err) {
        log.error(err);
        throw err;
    }
}

/**
 * Takes a warning submitted by a user and converts it into a notification.
 * It then works out which users need to be notified of this warning.
 * @param warningId
 * @param warningSubmission
 */
export async function newWarningSubmission(warningId: string, warningSubmission: IWarning) {
    // Build the notification for this warning.
    const title = prettyType(warningSubmission.type) + " Warning";
    const streetName = await getStreetName(warningSubmission.location.lat, warningSubmission.location.long);
    const body = `There has been an incident on or near ${streetName}.`;
    const date = new Date(Date.parse(warningSubmission.dateTime));

    const notification: INotification = {
        title,
        body,
        type: NotificationType.USER_SUBMITTED,
        warning: {
            warningId,
            type: warningSubmission.type,
            priority: warningSubmission.priority,
            location: warningSubmission.location,
            dateTime: date.toJSON(),
            information: warningSubmission.information,
        },
        dateTimeAdded: new Date(),
    };

    // Check if this warning is relevant for every single user.
    // Notify user if warning is relevant.
    let usersInformation;
    try {
        usersInformation = await UserRepository.getAllUsersInformation();
    } catch (err) {
        // Just return, error has already been logged.
        return;
    }

    // Work out which users need to be notified.
    const usersToNotify: string[] = [];
    for (const userInfo of usersInformation) {
        const warning = createWarning(warningSubmission);
        if (warning.calculateRelevance(userInfo) >= MINIMUM_NOTIFICATION_RELEVANCE) {
            // Add user to list.
            usersToNotify.push(userInfo.username);
        }
    }

    // Notify the users.
    usersToNotify.forEach(async (username) => {
        // Get fcm token from database.
        let token;
        try {
            token = await UserRepository.getFCMToken(username);
        } catch (err) {
            // Just return, error has already been logged.
            return;
        }

        // Send notification to user.
        try {
            await sendNotification(notification, token);
        } catch (err) {
            log.error(err);
        }
    });
}

/**
 * Calls the Google Maps geocode API to get a street name for given coords.
 * If the request fails, 'Selly Oak' will be returned.
 * @param lat
 * @param long
 */
async function getStreetName(lat: number, long: number) {

    if (process.env.NODE_ENV !== "production") {
        // Don't want to waste these API calls as they cost real money.
        return "Selly Oak";
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${config.googleApiKey}`;

    let data;
    try {
        const response = await axios(url);
        data = await response.data;
    } catch (err) {
        log.error(err);
        return "Selly Oak";
    }

    // Find road name.
    if (data.status !== "OK") {
        return "Selly Oak";
    }

    // Parse response to find the road name.
    for (const result of data.results) {
        for (const addressComponent of result.address_components) {
            for (const type of  addressComponent.types) {
                if (type === "route") {
                    return addressComponent.long_name;
                }
            }
        }
    }

    return "Selly Oak";
}
