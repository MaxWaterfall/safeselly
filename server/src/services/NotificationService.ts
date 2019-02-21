import axios from "axios";
import * as admin from "firebase-admin";
import { getPriorityForWarningType, IReturnWarning, ISubmissionWarning } from "../../../shared/Warnings";
import { HttpRequestError } from "../helper/HttpRequestError";
import { INotification, NotificationType, Priority } from "../helper/Notification";
import * as NotificationQueue from "../helper/NotificationQueue";
import * as log from "./../helper/Logger";
import { config } from "./../Server";
import * as serviceAccount from "./../serviceAccountKey.json";

/**
 * Initialise the Firebase Admin SDK.
 */
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

/**
 * Send a notification to all app users.
 * @param warning
 */
export async function sendNotificationToAll(notification: INotification) {
    let data;
    if (notification.type === NotificationType.USER_SUBMITTED) {
        data = {warning: JSON.stringify(notification.warning)};
    } else {
        // TODO: Add payload for SERVER_GENERATED notifications.
    }

    // Create the message.
    const message = {
        topic: "testing",
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
        log.info("Sent notification.");
    } catch (err) {
        log.error(err);
        throw err;
    }
}

/**
 * Takes a warning submitted by a user and converts it into a notification, then adds it to the NotificationQueue.
 * @param warningId
 * @param warning
 */
export async function newWarningSubmission(warningId: string, warning: ISubmissionWarning) {
    // Build the notification for this warning.
    const priority = getPriorityForWarningType(warning.type);
    const title = warning.type.substring(0, 1).toUpperCase() + warning.type.substring(1) + " Warning";
    const streetName = await getStreetName(warning.location.lat, warning.location.long);
    const body = `There has been an incident on or near ${streetName}.`;
    const date = new Date(Date.parse(warning.dateTime));

    const notification: INotification = {
        priority,
        title,
        body,
        type: NotificationType.USER_SUBMITTED,
        warning: {
            warningId,
            type: warning.type,
            priority: getPriorityForWarningType(warning.type),
            location: warning.location,
            dateTime: date.toJSON(),
        },
        dateTimeAdded: new Date(),
    };

    NotificationQueue.addNotification(notification);
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
