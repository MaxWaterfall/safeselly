import { IWarningSubmission } from "./../helper/Warnings";
import { makeAuthenticatedRequest } from "./NetworkService";

export async function sendWarning(warning: IWarningSubmission) {
    // TODO: Validate warning.
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