import axios from "axios";
// @ts-ignore No type definitions exist for this library.
import datetimeDifference from "datetime-difference";
import * as admin from "firebase-admin";
import { IReturnWarning, ISubmissionWarning } from "../../../shared/Warnings";
import * as log from "./../helper/Logger";
import { config } from "./../Server";
import * as serviceAccount from "./../serviceAccountKey.json";

// How old a warning can be before it will no longer be pushed as a notification.
const MAXIMUM_NOTIFICATION_TIME = 30;

/**
 * Initialise the Firebase Admin SDK.
 */
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

/**
 * Send a warning notification to all app users.
 * @param warning
 * @param title
 * @param body
 */
function sendWarningToAll(warning: IReturnWarning, title: string, body: string) {
    const message = {
        topic: "all",
        android: {
            priority: "high",
            notification: {
                title,
                body,
                sound: "default",
            },
        },
        data: {
            warning: JSON.stringify(warning),
        },
    };

    admin.messaging().send(message as any)
        .catch((err) => {
            log.error(err);
        });
}

/**
 * Takes a warning and decides whether to notify users of it or not.
 * In the future this will take warning type into account.
 * @param warningId
 * @param warning
 */
export async function newWarningSubmission(warningId: string, warning: ISubmissionWarning) {
    // Check if warning date time is within valid time.
    // We only want to send a notification if the warning is new.
    if (isDateTimeWithinMinutes(new Date(warning.dateTime), MAXIMUM_NOTIFICATION_TIME)) {
        // Notify users of this warning.
        const title = warning.type.substring(0, 1).toUpperCase() + warning.type.substring(1) + " Warning";
        const streetName = await getStreetName(warning.location.lat, warning.location.long);
        const body = `There has been an incident on or near ${streetName}.`;
        const date = new Date(Date.parse(warning.dateTime)).toJSON();
        sendWarningToAll({
            warningId,
            type: warning.type,
            location: warning.location,
            dateTime: date,
        }, title, body);
    }
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

/**
 * Checks if a date is within {minutes} minutes from now.
 * @param date
 * @param minutes
 */
function isDateTimeWithinMinutes(date: Date, minutes: number): boolean {
    const now = new Date();
    const diff = datetimeDifference(date, now);

    if (diff.years > 0) {
        return false;
    }

    if (diff.months > 0) {
        return false;
    }

    if (diff.days > 0) {
        return false;
    }

    if (diff.hours > 0) {
        return false;
    }

    if (diff.minutes > minutes) {
        return false;
    }

    return true;
}
