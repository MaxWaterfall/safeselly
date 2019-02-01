import { IWarningSubmission } from "./../helper/Warnings";
import { makeAuthenticatedRequest } from "./NetworkService";

export const PEOP_DESC_MAX_LENGTH = 400;
export const WARN_DESC_MAX_LENGTH = 400;
export const WARN_DESC_MIN_LENGTH = 20;
export const MAX_DIS_FROM_SELLY_OAK = 5; // km

export async function sendWarning(warning: IWarningSubmission) {
    // Validate warning.
    if (warning.information.peopleDescription.length > PEOP_DESC_MAX_LENGTH) {
        throw new Error("Person(s) description cannot be longer than " + PEOP_DESC_MAX_LENGTH + " characters.");
    }

    if (warning.information.warningDescription.length > WARN_DESC_MAX_LENGTH) {
        throw new Error("Incident description cannot be longer than " + WARN_DESC_MAX_LENGTH + " characters.");
    }

    if (warning.information.warningDescription.length < WARN_DESC_MIN_LENGTH) {
        throw new Error("Incident description needs to be at least " + WARN_DESC_MIN_LENGTH + " characters long.");
    }

    try {
        await makeAuthenticatedRequest("POST", "/warning/", {warning});
    } catch (err) {
        throw err;
    }
}

/**
 * Converts the date into the format the server understands.
 */
export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = addZero((date.getMonth() + 1).toString());
    const day = addZero((date.getDate()).toString());

    const hours = addZero(date.getHours().toString());
    const minutes = addZero(date.getMinutes().toString());
    const seconds = "00";

    // Format: YYYY-MM-DD HH:MM:SS
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Adds a "0" in front of the target string if it only has one character.
 * @param target
 */
function addZero(target: string): string {
    if (target.length === 1) {
        return "0" + target;
    }

    return target;
}
